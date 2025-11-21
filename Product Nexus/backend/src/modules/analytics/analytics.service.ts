import { PrismaClient } from '@prisma/client';
import { logger } from '../../utils/logger';

const prisma = new PrismaClient();

export class AnalyticsService {
  
  async getDashboardMetrics(companyId: string, startDate?: string, endDate?: string) {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    const [
      totalLeads,
      qualifiedLeads,
      unqualifiedLeads,
      sentToCrm,
      converted,
      averageScore,
      leadsBySource,
      leadsByStatus
    ] = await Promise.all([
      // Total leads
      prisma.lead.count({
        where: { companyId, ...dateFilter }
      }),

      // Qualified leads
      prisma.lead.count({
        where: { companyId, status: 'QUALIFIED', ...dateFilter }
      }),

      // Unqualified leads
      prisma.lead.count({
        where: { companyId, status: 'UNQUALIFIED', ...dateFilter }
      }),

      // Sent to CRM
      prisma.lead.count({
        where: { companyId, sentToCrm: true, ...dateFilter }
      }),

      // Converted
      prisma.lead.count({
        where: { companyId, status: 'CONVERTED', ...dateFilter }
      }),

      // Average score
      prisma.lead.aggregate({
        where: { companyId, score: { not: null }, ...dateFilter },
        _avg: { score: true }
      }),

      // Leads by source
      prisma.lead.groupBy({
        by: ['source'],
        where: { companyId, ...dateFilter },
        _count: true
      }),

      // Leads by status
      prisma.lead.groupBy({
        by: ['status'],
        where: { companyId, ...dateFilter },
        _count: true
      })
    ]);

    const qualificationRate = totalLeads > 0 
      ? ((qualifiedLeads / totalLeads) * 100).toFixed(2)
      : 0;

    const conversionRate = sentToCrm > 0
      ? ((converted / sentToCrm) * 100).toFixed(2)
      : 0;

    return {
      overview: {
        totalLeads,
        qualifiedLeads,
        unqualifiedLeads,
        sentToCrm,
        converted,
        qualificationRate: `${qualificationRate}%`,
        conversionRate: `${conversionRate}%`,
        averageScore: averageScore._avg.score?.toFixed(1) || 0
      },
      leadsBySource: leadsBySource.map(item => ({
        source: item.source,
        count: item._count
      })),
      leadsByStatus: leadsByStatus.map(item => ({
        status: item.status,
        count: item._count
      }))
    };
  }

  async getFunnelData(companyId: string, startDate?: string, endDate?: string) {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    const stages = [
      { status: 'NEW', name: 'Recebidos' },
      { status: 'ENRICHED', name: 'Enriquecidos' },
      { status: 'QUALIFIED', name: 'Qualificados' },
      { status: 'SENT_TO_CRM', name: 'Enviados ao CRM' },
      { status: 'CONVERTED', name: 'Convertidos' }
    ];

    const counts = await Promise.all(
      stages.map(stage =>
        prisma.lead.count({
          where: {
            companyId,
            status: stage.status as any,
            ...dateFilter
          }
        })
      )
    );

    return stages.map((stage, index) => ({
      stage: stage.name,
      count: counts[index],
      percentage: index === 0 
        ? 100 
        : counts[0] > 0 
          ? ((counts[index] / counts[0]) * 100).toFixed(1)
          : 0
    }));
  }

  async getSourcesPerformance(companyId: string, startDate?: string, endDate?: string) {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    const sources = await prisma.lead.groupBy({
      by: ['source'],
      where: { companyId, ...dateFilter },
      _count: true,
      _avg: { score: true }
    });

    const sourceStats = await Promise.all(
      sources.map(async (source) => {
        const [qualified, converted] = await Promise.all([
          prisma.lead.count({
            where: {
              companyId,
              source: source.source,
              status: 'QUALIFIED',
              ...dateFilter
            }
          }),
          prisma.lead.count({
            where: {
              companyId,
              source: source.source,
              status: 'CONVERTED',
              ...dateFilter
            }
          })
        ]);

        const qualificationRate = source._count > 0
          ? ((qualified / source._count) * 100).toFixed(1)
          : 0;

        const conversionRate = qualified > 0
          ? ((converted / qualified) * 100).toFixed(1)
          : 0;

        return {
          source: source.source,
          totalLeads: source._count,
          qualifiedLeads: qualified,
          convertedLeads: converted,
          averageScore: source._avg.score?.toFixed(1) || 0,
          qualificationRate: `${qualificationRate}%`,
          conversionRate: `${conversionRate}%`
        };
      })
    );

    return sourceStats.sort((a, b) => b.totalLeads - a.totalLeads);
  }

  async getROI(companyId: string, startDate?: string, endDate?: string) {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    // Get campaign data
    const campaigns = await prisma.campaign.findMany({
      where: { companyId, ...dateFilter },
      include: {
        _count: {
          select: {
            leads: true
          }
        }
      }
    });

    const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
    const totalLeads = campaigns.reduce((sum, c) => sum + c._count.leads, 0);

    const qualified = await prisma.lead.count({
      where: {
        companyId,
        status: 'QUALIFIED',
        campaignId: { not: null },
        ...dateFilter
      }
    });

    const converted = await prisma.lead.count({
      where: {
        companyId,
        status: 'CONVERTED',
        campaignId: { not: null },
        ...dateFilter
      }
    });

    const costPerLead = totalLeads > 0 ? (totalSpend / totalLeads) : 0;
    const costPerQualified = qualified > 0 ? (totalSpend / qualified) : 0;
    const costPerConversion = converted > 0 ? (totalSpend / converted) : 0;

    // Estimated revenue (would need actual revenue data in production)
    const estimatedRevenue = converted * 15000; // Placeholder: R$ 15k per conversion
    const roi = totalSpend > 0 ? (((estimatedRevenue - totalSpend) / totalSpend) * 100) : 0;

    return {
      totalSpend: totalSpend.toFixed(2),
      totalLeads,
      qualifiedLeads: qualified,
      convertedLeads: converted,
      costPerLead: costPerLead.toFixed(2),
      costPerQualified: costPerQualified.toFixed(2),
      costPerConversion: costPerConversion.toFixed(2),
      estimatedRevenue: estimatedRevenue.toFixed(2),
      roi: `${roi.toFixed(1)}%`,
      campaigns: campaigns.map(c => ({
        name: c.name,
        source: c.source,
        spend: c.spend,
        leads: c._count.leads,
        costPerLead: c._count.leads > 0 ? (c.spend / c._count.leads).toFixed(2) : 0
      }))
    };
  }

  async getLeadQuality(companyId: string, startDate?: string, endDate?: string) {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    // Score distribution
    const scoreRanges = [
      { min: 0, max: 20, label: '0-20' },
      { min: 21, max: 40, label: '21-40' },
      { min: 41, max: 60, label: '41-60' },
      { min: 61, max: 80, label: '61-80' },
      { min: 81, max: 100, label: '81-100' }
    ];

    const distribution = await Promise.all(
      scoreRanges.map(range =>
        prisma.lead.count({
          where: {
            companyId,
            score: {
              gte: range.min,
              lte: range.max
            },
            ...dateFilter
          }
        }).then(count => ({
          range: range.label,
          count
        }))
      )
    );

    // Email quality
    const [totalWithEmail, validEmails, disposableEmails] = await Promise.all([
      prisma.lead.count({
        where: { companyId, email: { not: null }, ...dateFilter }
      }),
      prisma.lead.count({
        where: {
          companyId,
          email: { not: null },
          enrichedData: {
            path: ['emailValidation', 'valid'],
            equals: true
          },
          ...dateFilter
        }
      }),
      prisma.lead.count({
        where: {
          companyId,
          enrichedData: {
            path: ['emailValidation', 'disposable'],
            equals: true
          },
          ...dateFilter
        }
      })
    ]);

    return {
      scoreDistribution: distribution,
      emailQuality: {
        total: totalWithEmail,
        valid: validEmails,
        disposable: disposableEmails,
        validRate: totalWithEmail > 0 
          ? `${((validEmails / totalWithEmail) * 100).toFixed(1)}%`
          : '0%'
      }
    };
  }

  async getTimelineData(
    companyId: string,
    startDate?: string,
    endDate?: string,
    groupBy: string = 'day'
  ) {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    const leads = await prisma.lead.findMany({
      where: { companyId, ...dateFilter },
      select: {
        createdAt: true,
        status: true,
        score: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group by date
    const grouped = this.groupByDate(leads, groupBy);

    return Object.entries(grouped).map(([date, items]: [string, any[]]) => ({
      date,
      total: items.length,
      qualified: items.filter(l => l.status === 'QUALIFIED').length,
      unqualified: items.filter(l => l.status === 'UNQUALIFIED').length,
      converted: items.filter(l => l.status === 'CONVERTED').length,
      averageScore: items.length > 0
        ? (items.reduce((sum, l) => sum + (l.score || 0), 0) / items.length).toFixed(1)
        : 0
    }));
  }

  private buildDateFilter(startDate?: string, endDate?: string) {
    const filter: any = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      
      if (startDate) {
        filter.createdAt.gte = new Date(startDate);
      }
      
      if (endDate) {
        filter.createdAt.lte = new Date(endDate);
      }
    }

    return filter;
  }

  private groupByDate(items: any[], groupBy: string) {
    const grouped: { [key: string]: any[] } = {};

    items.forEach(item => {
      let key: string;

      switch (groupBy) {
        case 'week':
          const weekStart = new Date(item.createdAt);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;

        case 'month':
          key = item.createdAt.toISOString().slice(0, 7); // YYYY-MM
          break;

        default: // day
          key = item.createdAt.toISOString().split('T')[0];
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(item);
    });

    return grouped;
  }
}

