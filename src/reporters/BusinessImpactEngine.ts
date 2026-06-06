export interface BusinessContext {
  avgSessionValue: number;
  peakSessionsPerHour: number;
  failureDurationMin: number;
  label: string;
}

export class BusinessImpactEngine {
  private static contextMap: Record<string, BusinessContext> = {
    '/payments': {
      avgSessionValue: 12,
      peakSessionsPerHour: 480,
      failureDurationMin: 30,
      label: 'Payment Processing',
    },
    '/sessions': {
      avgSessionValue: 8,
      peakSessionsPerHour: 600,
      failureDurationMin: 15,
      label: 'Session Management',
    },
    '/ev_chargers': {
      avgSessionValue: 25,
      peakSessionsPerHour: 120,
      failureDurationMin: 45,
      label: 'EV Charging Activation',
    },
  };

  static calculate(endpoint: string): string {
    // Exact or partial match logic
    const matchedKey = Object.keys(this.contextMap).find(
      key => endpoint.startsWith(key) || key.startsWith(endpoint)
    );
    
    const context = matchedKey ? this.contextMap[matchedKey] : {
      avgSessionValue: 10,
      peakSessionsPerHour: 100,
      failureDurationMin: 15,
      label: 'General Endpoint',
    };

    const sessionsAffected = Math.round((context.peakSessionsPerHour * context.failureDurationMin) / 60);
    const revenueImpact = sessionsAffected * context.avgSessionValue;

    let severity = 'MEDIUM';
    let emoji = '🟡';
    if (revenueImpact > 2000) {
      severity = 'CRITICAL';
      emoji = '🔴';
    } else if (revenueImpact > 500) {
      severity = 'HIGH';
      emoji = '🟠';
    }

    const formattedRevenue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(revenueImpact);

    return `${emoji} ${severity} | ~${sessionsAffected} sessions affected | Estimated revenue impact: ${formattedRevenue}`;
  }
}
