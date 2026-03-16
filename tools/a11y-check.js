#!/usr/bin/env node
// Lightweight accessibility checks (fallback when axe-cli can't run)
// Usage: node tools/a11y-check.js <url>
const fs = require('fs');
const url = process.argv[2] || 'https://guileless-halva-39e976.netlify.app/';
(async()=>{
  try {
    const res = await fetch(url);
    const html = await res.text();
    const cheerio = require('cheerio');
    const $ = cheerio.load(html);
    const report = { url, checks: [] };

    // 1. lang attribute
    const lang = $('html').attr('lang');
    report.checks.push({ id: 'html-lang', ok: !!lang, value: lang || null, msg: lang ? 'html lang present' : 'html lang missing' });

    // 2. title
    const title = $('head title').text();
    report.checks.push({ id: 'title', ok: !!title, value: title || null, msg: title ? 'title present' : 'title missing' });

    // 3. theme toggle
    const toggle = $('#theme-toggle');
    report.checks.push({ id: 'theme-toggle', ok: toggle.length>0, msg: toggle.length>0 ? 'theme toggle present' : 'theme toggle missing' });
    if (toggle.length>0) {
      report.checks.push({ id: 'theme-toggle-aria', ok: !!toggle.attr('aria-pressed'), value: toggle.attr('aria-pressed') || null, msg: 'aria-pressed ' + (toggle.attr('aria-pressed')||'missing') });
    }

    // 4. images have alt
    const imgs = $('img');
    const imgsMissingAlt = imgs.filter((i,el)=>!$(el).attr('alt')).length;
    report.checks.push({ id: 'images-alt', ok: imgsMissingAlt===0, value: imgs.length, missing: imgsMissingAlt, msg: imgsMissingAlt ? `${imgsMissingAlt}/${imgs.length} images missing alt` : 'all images have alt or none present' });

    // 5. headings structure
    const h1 = $('h1').length;
    const h2 = $('h2').length;
    report.checks.push({ id: 'headings', ok: h1>0, value: {h1,h2}, msg: `h1:${h1} h2:${h2}` });

    // 6. links with text
    const links = $('a');
    const linksNoText = links.filter((i,el)=>!$(el).text().trim()).length;
    report.checks.push({ id: 'links-text', ok: linksNoText===0, value: links.length, missing: linksNoText, msg: linksNoText ? `${linksNoText}/${links.length} links missing text` : 'all links have text' });

    // 7. small text contrast candidates (we only detect selectors present)
    const smallSelectors = ['.nuke-detail', '.news-date', '.src-link', '.budget-note'];
    smallSelectors.forEach(sel=>{
      const cnt = $(sel).length;
      report.checks.push({ id: `small-text:${sel}`, ok: cnt>0, value: cnt, msg: cnt? `found ${cnt}` : 'not found' });
    });

    // Save report
    fs.writeFileSync('a11y-lite-report.json', JSON.stringify(report, null, 2));
    console.log('Wrote a11y-lite-report.json');
  } catch (e) {
    console.error('Error running a11y-check', e);
    process.exit(2);
  }
})();
