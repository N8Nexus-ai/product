import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';
import { AuthRequest } from '../../middleware/auth';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  getDashboardMetrics = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user?.id; // In real app, get from user's company
      const { startDate, endDate } = req.query;

      if (!companyId) {
        return res.status(400).json({ error: 'Company ID required' });
      }

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
      const companyId = req.user?.id;
      const { startDate, endDate } = req.query;

      if (!companyId) {
        return res.status(400).json({ error: 'Company ID required' });
      }

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
      const companyId = req.user?.id;
      const { startDate, endDate } = req.query;

      if (!companyId) {
        return res.status(400).json({ error: 'Company ID required' });
      }

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
      const companyId = req.user?.id;
      const { startDate, endDate } = req.query;

      if (!companyId) {
        return res.status(400).json({ error: 'Company ID required' });
      }

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
      const companyId = req.user?.id;
      const { startDate, endDate } = req.query;

      if (!companyId) {
        return res.status(400).json({ error: 'Company ID required' });
      }

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
      const companyId = req.user?.id;
      const { startDate, endDate, groupBy = 'day' } = req.query;

      if (!companyId) {
        return res.status(400).json({ error: 'Company ID required' });
      }

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

