const keypad = (id) => `<div class="kp" data-pad="${id}">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button data-k="${n}">${n}</button>`).join("")}<button data-k="x" aria-label="Delete">\u232B</button><button data-k="0">0</button><button data-k="go" class="go" aria-label="OK">\u2714</button></div>`;
const pinBoxes = (id, n) => `<div class="pin" id="${id}">${Array.from({ length: n }, () => "<span></span>").join("")}</div>`;
function bindPad(root, id, max, onDone, mask) {
  let v = "";
  const pin = $("#" + id, root);
  const draw = () => [...pin.children].forEach((s, i) => {
    s.textContent = v[i] ? mask ? "\u25CF" : v[i] : "";
    s.classList.toggle("f", !!v[i]);
  });
  $(`[data-pad="${id}"]`, root).addEventListener("click", (e) => {
    const b = e.target.closest("[data-k]");
    if (!b) return;
    const k = b.dataset.k;
    if (k === "x") v = v.slice(0, -1);
    else if (k === "go") {
      onDone(v);
      return;
    } else if (v.length < max) v += k;
    draw();
  });
}
