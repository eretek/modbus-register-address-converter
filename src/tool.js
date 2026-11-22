/*! Eretek Online Araçlar #85 — Modbus Register Adres Dönüştürücü */
ERT.def('85', {
	T: { '0': ['coil', '01', '05 / 15'], '1': ['di', '02', '–'], '3': ['ir', '04', '–'], '4': ['hr', '03', '06 / 16'] },
	run: function (v, c) {
		var T = ERT.tools['85'].T, rows = [], out = [], cnt = v.count || 1;
		c.lines(v.addrs, 500, 'addrs').forEach(function (l, i) {
			var s = l.replace(/\s+/g, '').toLowerCase(), t, pdu, m;
			if (v.fmt === 'modicon') {
				if ((m = /^([0134])(\d{4,5})$/.exec(s)) || (m = /^([0134])x(\d{1,5})$/.exec(s))) {
					t = m[1]; var n = +m[2];
					if (n < 1 || n > 65536) { throw c.fe('addrs', 'range', { r: i + 1, a: l }); }
					pdu = n - 1;
				} else { throw c.fe('addrs', 'fmtM', { r: i + 1, a: l }); }
			} else {
				if (!/^\d+$/.test(s) && !/^0x[0-9a-f]+$/.test(s)) { throw c.fe('addrs', 'fmtN', { r: i + 1, a: l }); }
				var x = parseInt(s, s.indexOf('0x') === 0 ? 16 : 10);
				pdu = v.fmt === 'pdu0' ? x : x - 1; t = v.tbl;
				if (pdu < 0 || pdu > 65535) { throw c.fe('addrs', 'range', { r: i + 1, a: l }); }
			}
			var end = pdu + cnt - 1;
			if (end > 65535) { throw c.fe('count', 'over', { a: l }); }
			var hex = '0x' + ('000' + pdu.toString(16).toUpperCase()).slice(-4), five = pdu < 9999 ? t + ('000' + (pdu + 1)).slice(-4) : '–', six = t + ('0000' + (pdu + 1)).slice(-5);
			rows.push([l, c.t('t_' + T[t][0]), T[t][1], T[t][2], pdu, hex, five, six, cnt > 1 ? (pdu + 1) + '–' + (end + 1) + ' (PDU ' + pdu + '–' + end + ')' : '–']);
			out.push({ table: t, pdu: pdu, hex: hex, five: five, six: six });
		});
		var cols = [c.t('c_in'), c.t('c_t'), c.t('c_fr'), c.t('c_fw'), 'PDU', 'Hex', c.t('c_5'), c.t('c_6'), c.t('c_rng')];
		var msgs = [['info', c.t('off1')], ['info', c.t('vendor')]];
		if (out.some(function (o) { return o.five === '–'; })) { msgs.unshift(['warn', c.t('no5')]); }
		return { big: out.length === 1 ? c.t('big1', { p: out[0].pdu, h: out[0].hex, f: T[out[0].table][1] }) : c.t('bigN', { n: out.length }), msgs: msgs, tables: [{ cols: cols, rows: rows }], x: { copy: rows.map(function (r) { return r.join('\t'); }).join('\n') }, v: { list: out } };
	}
});
