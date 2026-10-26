// Calculator: uses only the visitor's own inputs. No assumed uplift.
document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);
  if (!$("enq")) return;
  const gbp = n => "£" + Math.round(n).toLocaleString("en-GB");

  function update() {
    const enq = +$("enq").value, cold = +$("cold").value / 100, conv = +$("conv").value / 100, profit = +$("profit").value;
    const coldN = enq * cold;
    const installs = coldN * conv;
    $("enq-o").textContent = enq;
    $("cold-o").textContent = Math.round(cold * 100) + "%";
    $("conv-o").textContent = Math.round(conv * 100) + "%";
    $("profit-o").textContent = gbp(profit);
    $("cold-n").textContent = Math.round(coldN);
    $("inst-n").textContent = installs.toFixed(1);
    $("stake").textContent = gbp(installs * profit);
  }
  ["enq", "cold", "conv", "profit"].forEach(id => $(id).addEventListener("input", update));
  update();
});
