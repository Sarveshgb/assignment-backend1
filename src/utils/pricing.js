import { differenceInDays, getDay } from 'date-fns';

/**
 * Calculate quote price based on business rules
 * @param {Object} params - Calculation parameters
 * @param {number} params.basePrice - Base price from package
 * @param {Date} params.eventDate - Event date
 * @param {Date} params.travelDate - Travel/booking date
 * @param {number} params.travelers - Number of travelers
 * @returns {Object} Price breakdown
 */
export const calculateQuotePrice = ({ basePrice, eventDate, travelDate, travelers }) => {
    const breakdown = {
        basePrice: parseFloat(basePrice),
        adjustments: [],
        finalPrice: parseFloat(basePrice)
    };

    // 1. Seasonal Multiplier
    const eventMonth = eventDate.getMonth() + 1; // 1-12
    let seasonalMultiplier = 0;

    if ([6, 7, 12].includes(eventMonth)) {
        // June, July, December → +20%
        seasonalMultiplier = 0.20;
        breakdown.adjustments.push({
            type: 'Seasonal Multiplier',
            description: 'Peak season (June/July/December)',
            percentage: 20,
            amount: breakdown.basePrice * seasonalMultiplier
        });
    } else if ([4, 5, 9].includes(eventMonth)) {
        // April, May, September → +10%
        seasonalMultiplier = 0.10;
        breakdown.adjustments.push({
            type: 'Seasonal Multiplier',
            description: 'High season (April/May/September)',
            percentage: 10,
            amount: breakdown.basePrice * seasonalMultiplier
        });
    }

    breakdown.finalPrice += breakdown.basePrice * seasonalMultiplier;

    // 2. Early-Bird Discount
    const daysUntilEvent = differenceInDays(eventDate, travelDate);
    let earlyBirdDiscount = 0;

    if (daysUntilEvent >= 120) {
        // 120 days before event → −10%
        earlyBirdDiscount = -0.10;
        const discountAmount = breakdown.basePrice * Math.abs(earlyBirdDiscount);
        breakdown.adjustments.push({
            type: 'Early-Bird Discount',
            description: 'Booked 120+ days in advance',
            percentage: -10,
            amount: -discountAmount
        });
        breakdown.finalPrice -= discountAmount;
    }

    // 3. Last-Minute Surcharge
    let lastMinuteSurcharge = 0;

    if (daysUntilEvent < 15) {
        // <15 days before event → +25%
        lastMinuteSurcharge = 0.25;
        const surchargeAmount = breakdown.basePrice * lastMinuteSurcharge;
        breakdown.adjustments.push({
            type: 'Last-Minute Surcharge',
            description: 'Booked less than 15 days before event',
            percentage: 25,
            amount: surchargeAmount
        });
        breakdown.finalPrice += surchargeAmount;
    }

    // 4. Group Discount
    let groupDiscount = 0;

    if (travelers >= 4) {
        // Travelers ≥ 4 → −8%
        groupDiscount = -0.08;
        const discountAmount = breakdown.basePrice * Math.abs(groupDiscount);
        breakdown.adjustments.push({
            type: 'Group Discount',
            description: `${travelers} travelers (4+ people)`,
            percentage: -8,
            amount: -discountAmount
        });
        breakdown.finalPrice -= discountAmount;
    }

    // 5. Weekend Surcharge
    let weekendSurcharge = 0;
    const dayOfWeek = getDay(eventDate); // 0 = Sunday, 6 = Saturday

    if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Event includes Saturday or Sunday → +8%
        weekendSurcharge = 0.08;
        const surchargeAmount = breakdown.basePrice * weekendSurcharge;
        breakdown.adjustments.push({
            type: 'Weekend Surcharge',
            description: 'Event on weekend',
            percentage: 8,
            amount: surchargeAmount
        });
        breakdown.finalPrice += surchargeAmount;
    }

    // Round final price to 2 decimal places
    breakdown.finalPrice = Math.round(breakdown.finalPrice * 100) / 100;

    // Store raw multipliers for database
    breakdown.multipliers = {
        seasonal_multiplier: seasonalMultiplier,
        early_bird_discount: earlyBirdDiscount,
        last_minute_surcharge: lastMinuteSurcharge,
        group_discount: groupDiscount,
        weekend_surcharge: weekendSurcharge
    };

    return breakdown;
};

/**
 * Validate lead status transition
 * @param {string} fromStatus - Current status
 * @param {string} toStatus - New status
 * @returns {boolean} Whether transition is valid
 */
export const isValidStatusTransition = (fromStatus, toStatus) => {
    const validTransitions = {
        'New': ['Contacted'],
        'Contacted': ['Quote Sent', 'Closed Lost'],
        'Quote Sent': ['Interested', 'Closed Lost'],
        'Interested': ['Closed Won', 'Closed Lost'],
        'Closed Won': [],
        'Closed Lost': []
    };

    if (!fromStatus) {
        return toStatus === 'New';
    }

    return validTransitions[fromStatus]?.includes(toStatus) || false;
};
