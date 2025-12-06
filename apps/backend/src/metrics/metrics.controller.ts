import { Controller, Get, Post, Param, UseGuards, Request } from "@nestjs/common";
import { MetricsService } from "./metrics.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../auth/types/user-role.enum";

/**
 * MetricsController - API endpoints for pre-computed metrics
 * 
 * Provides fast read access to pre-computed metrics stored in database tables.
 * Metrics are automatically recomputed after CRUD operations (see service integrations).
 * 
 * Performance: ~50ms response time vs ~500ms for on-the-fly calculations
 */
@Controller("metrics")
@UseGuards(JwtAuthGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  /**
   * GET /metrics/dashboard
   * Returns pre-computed dashboard metrics for the user's organization
   * Automatically computes metrics on first access if they don't exist (lazy initialization)
   */
  @Get("dashboard")
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance, UserRole.Viewer)
  @UseGuards(RolesGuard)
  async getDashboardMetrics(@Request() req) {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return null;
    }

    // Try to get cached metrics first
    let metrics = await this.metricsService.getDashboardMetrics(organizationId);
    
    // LAZY INITIALIZATION: Compute metrics on first access if they don't exist
    // This ensures metrics are always available after first request
    if (!metrics) {
      try {
        await this.metricsService.recomputeDashboardMetrics(organizationId);
        metrics = await this.metricsService.getDashboardMetrics(organizationId);
      } catch (error) {
        console.error("Error computing dashboard metrics on first access:", error);
        // Return null to trigger frontend fallback
        return null;
      }
    }

    return metrics;
  }

  /**
   * GET /metrics/events/:eventId
   * Returns pre-computed event metrics for a specific event
   * Automatically computes metrics on first access if they don't exist (lazy initialization)
   * Includes: budget totals, expense counts, variance, etc.
   */
  @Get("events/:eventId")
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance, UserRole.Viewer)
  @UseGuards(RolesGuard)
  async getEventMetrics(@Param("eventId") eventId: string) {
    // Try to get cached metrics first
    let metrics = await this.metricsService.getEventMetrics(eventId);
    
    // LAZY INITIALIZATION: Compute metrics on first access if they don't exist
    if (!metrics) {
      try {
        await this.metricsService.recomputeEventMetrics(eventId);
        metrics = await this.metricsService.getEventMetrics(eventId);
      } catch (error) {
        console.error("Error computing event metrics on first access:", error);
        // Return null to trigger frontend fallback
        return null;
      }
    }

    return metrics;
  }

  /**
   * GET /metrics/vendors/:vendorId
   * Returns pre-computed vendor metrics for a specific vendor
   * Automatically computes metrics on first access if they don't exist (lazy initialization)
   * Includes: totalContracts, totalSpent, lastContractDate, etc.
   */
  @Get("vendors/:vendorId")
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance, UserRole.Viewer)
  @UseGuards(RolesGuard)
  async getVendorMetrics(@Param("vendorId") vendorId: string) {
    // Try to get cached metrics first
    let metrics = await this.metricsService.getVendorMetrics(vendorId);
    
    // LAZY INITIALIZATION: Compute metrics on first access if they don't exist
    if (!metrics) {
      try {
        await this.metricsService.recomputeVendorMetrics(vendorId);
        metrics = await this.metricsService.getVendorMetrics(vendorId);
      } catch (error) {
        console.error("Error computing vendor metrics on first access:", error);
        // Return null to trigger frontend fallback
        return null;
      }
    }

    return metrics;
  }

  /**
   * POST /metrics/recompute/dashboard
   * Manually trigger dashboard metrics recomputation (Admin only)
   * Useful for data migration or fixing inconsistencies
   */
  @Post("recompute/dashboard")
  @Roles(UserRole.Admin)
  @UseGuards(RolesGuard)
  async recomputeDashboard(@Request() req) {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      throw new Error("Organization ID required");
    }

    await this.metricsService.recomputeDashboardMetrics(organizationId);
    return { success: true, message: "Dashboard metrics recomputed" };
  }

  /**
   * POST /metrics/recompute/events/:eventId
   * Manually trigger event metrics recomputation (Admin/EventManager)
   * Useful for fixing inconsistencies or after bulk data imports
   */
  @Post("recompute/events/:eventId")
  @Roles(UserRole.Admin, UserRole.EventManager)
  @UseGuards(RolesGuard)
  async recomputeEventMetrics(@Param("eventId") eventId: string) {
    await this.metricsService.recomputeEventMetrics(eventId);
    return { success: true, message: "Event metrics recomputed" };
  }
}

