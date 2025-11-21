import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';
import { AuthRequest } from '../../middleware/auth';
import { getCompanyIdForQuery } from '../../utils/user-helper';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  getDashboardMetrics = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate, companyId: companyIdFromQuery } = req.query;

      // Obtém o companyId baseado no role do usuário
      // ADMIN: undefined (ver todos) ou o companyId do query (se fornecido)
      // Outros: companyId do próprio usuário
      const companyId = await getCompanyIdForQuery(req, companyIdFromQuery as string);

      const metrics = await this.analyticsService.getDashboardMetrics(
        companyId,
        startDate as string,
        endDate as string
      );

      res.json({
        status: 'success',
        data: metrics
      });
    } catch (error) {
      next(error);
    }
  };

  getFunnelData = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate, companyId: companyIdFromQuery } = req.query;

      const companyId = await getCompanyIdForQuery(req, companyIdFromQuery as string);

      const funnel = await this.analyticsService.getFunnelData(
        companyId,
        startDate as string,
        endDate as string
      );

      res.json({
        status: 'success',
        data: funnel
      });
    } catch (error) {
      next(error);
    }
  };

  getSourcesPerformance = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate, companyId: companyIdFromQuery } = req.query;

      const companyId = await getCompanyIdForQuery(req, companyIdFromQuery as string);

      const sources = await this.analyticsService.getSourcesPerformance(
        companyId,
        startDate as string,
        endDate as string
      );

      res.json({
        status: 'success',
        data: sources
      });
    } catch (error) {
      next(error);
    }
  };

  getROI = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate, companyId: companyIdFromQuery } = req.query;

      const companyId = await getCompanyIdForQuery(req, companyIdFromQuery as string);

      const roi = await this.analyticsService.getROI(
        companyId,
        startDate as string,
        endDate as string
      );

      res.json({
        status: 'success',
        data: roi
      });
    } catch (error) {
      next(error);
    }
  };

  getLeadQuality = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate, companyId: companyIdFromQuery } = req.query;

      const companyId = await getCompanyIdForQuery(req, companyIdFromQuery as string);

      const quality = await this.analyticsService.getLeadQuality(
        companyId,
        startDate as string,
        endDate as string
      );

      res.json({
        status: 'success',
        data: quality
      });
    } catch (error) {
      next(error);
    }
  };

  getTimelineData = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate, groupBy = 'day', companyId: companyIdFromQuery } = req.query;

      const companyId = await getCompanyIdForQuery(req, companyIdFromQuery as string);

      const timeline = await this.analyticsService.getTimelineData(
        companyId,
        startDate as string,
        endDate as string,
        groupBy as string
      );

      res.json({
        status: 'success',
        data: timeline
      });
    } catch (error) {
      next(error);
    }
  };
}

