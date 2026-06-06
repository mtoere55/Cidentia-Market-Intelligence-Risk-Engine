function round(value, decimals = 2) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Number(n.toFixed(decimals));
}

function getPlanQuality(item) {
  const plan = item.virtualTradePlan || {};
  const rr = Number(plan.riskRewardToTp1 || 0);

  if (!plan.enabled) return 'plan yok';
  if (plan.quality === 'sanal test uygun' && rr >= 1.5) return 'güçlü sanal aday';
  if (plan.quality === 'sanal test uygun') return 'sanal test adayı';
  if (rr > 0 && rr < 1) return 'risk/ödül zayıf';
  return plan.quality || 'bekle';
}

export function buildOperatorAdvice(item) {
  const plan = item.virtualTradePlan || {};
  const mm = item.moneyManagement || {};
  const rr = Number(plan.riskRewardToTp1 || 0);
  const confidence = Number(item.confidence || 0);
  const score = Number(item.score || 0);
  const risk = item.riskTier || 'unknown';
  const action = item.decision?.action || 'UNKNOWN';
  const direction = item.directionBias || 'neutral';

  let operatorAction = 'NO_TRADE';
  let label = 'işlem açmazdım';
  let priority = 0;
  const reasons = [];

  if (action.startsWith('AVOID') || risk === 'extreme') {
    operatorAction = 'AVOID';
    label = 'uzak dururdum';
    priority = 5;
    reasons.push('Risk çok yüksek veya sistem kaçın diyor.');
  } else if (!plan.enabled) {
    operatorAction = 'WAIT';
    label = 'beklerdim';
    priority = 10;
    reasons.push('Giriş-stop-kar planı yok.');
  } else if (rr > 0 && rr < 1) {
    operatorAction = 'WATCH_ONLY';
    label = 'sadece izlerdim';
    priority = 20;
    reasons.push('Risk/ödül oranı 1 altında; alınan riske göre hedef zayıf.');
  } else if (plan.quality === 'sanal test uygun' && rr >= 1.5 && confidence >= 65 && risk !== 'high') {
    operatorAction = 'VIRTUAL_TEST_STRONG';
    label = 'güçlü sanal aday olarak izlerdim';
    priority = 90;
    reasons.push('Güven, risk ve risk/ödül sanal test için daha iyi.');
  } else if (plan.quality === 'sanal test uygun' && confidence >= 55) {
    operatorAction = 'VIRTUAL_TEST_SMALL';
    label = 'küçük sanal test listesine alırdım';
    priority = 70;
    reasons.push('Sanal test mümkün ama güçlü aday değil.');
  } else if (action === 'LONG_WATCH' || action === 'SHORT_WATCH') {
    operatorAction = 'WATCH_ONLY';
    label = 'sadece izlerdim';
    priority = 40;
    reasons.push('Yön var ama işlem kalitesi temiz değil.');
  } else {
    reasons.push('Sistem net fırsat görmüyor.');
  }

  if (confidence < 50) reasons.push('Güven puanı düşük.');
  if (risk === 'high') reasons.push('Risk seviyesi yüksek.');
  if (item.metrics?.liquidityScore < 40) reasons.push('Likidite zayıf.');
  if (direction === 'neutral') reasons.push('Yön zayıf veya kararsız.');

  const actionText = [
    `${item.symbol}: ${label}.`,
    `Yön: ${direction}.`,
    `Puan/Güven: ${score}/${confidence}.`,
    `Risk: ${risk}.`,
    plan.enabled ? `R/R: ${rr || '-'}.` : 'R/R: plan yok.',
    mm.enabled ? `100 € modelde önerilen sanal pozisyon: ${mm.suggestedPositionEur} €; maksimum sanal risk: ${mm.maxRiskEur} €.` : 'Sanal pozisyon hesabı yok.',
  ].join(' ');

  return {
    operatorAction,
    label,
    priority,
    planQuality: getPlanQuality(item),
    actionText,
    reasons,
    riskReward: rr ? round(rr, 2) : null,
    suggestedVirtualPositionEur: mm.enabled ? mm.suggestedPositionEur : null,
    maxVirtualRiskEur: mm.enabled ? mm.maxRiskEur : null,
  };
}

export function attachOperatorAdvice(results) {
  return results.map((item) => ({
    ...item,
    operatorAdvice: buildOperatorAdvice(item),
  }));
}

export function buildOperatorSummary(results) {
  const withAdvice = results.filter((item) => item.operatorAdvice);
  const sorted = [...withAdvice].sort((a, b) => b.operatorAdvice.priority - a.operatorAdvice.priority);

  return {
    strongVirtual: sorted.filter((item) => item.operatorAdvice.operatorAction === 'VIRTUAL_TEST_STRONG').slice(0, 5),
    smallVirtual: sorted.filter((item) => item.operatorAdvice.operatorAction === 'VIRTUAL_TEST_SMALL').slice(0, 5),
    watchOnly: sorted.filter((item) => item.operatorAdvice.operatorAction === 'WATCH_ONLY').slice(0, 5),
    avoid: sorted.filter((item) => item.operatorAdvice.operatorAction === 'AVOID').slice(0, 5),
    topOperatorList: sorted.slice(0, 8).map((item) => ({
      symbol: item.symbol,
      action: item.operatorAdvice.label,
      priority: item.operatorAdvice.priority,
      direction: item.directionBias,
      score: item.score,
      confidence: item.confidence,
      risk: item.riskTier,
      rr: item.operatorAdvice.riskReward,
      text: item.operatorAdvice.actionText,
    })),
  };
}
