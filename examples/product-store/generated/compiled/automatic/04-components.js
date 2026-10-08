// Lesson 4: components are functions React calls for you.
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { log } from '../../log';
import { products, formatUSD } from '../../data/products';

// #region price
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function Price({
  cents
}) {
  log('  Price runs');
  return _jsx("p", {
    className: "price",
    children: formatUSD(cents)
  });
}
// #endregion

// #region card
function ProductCard({
  product
}) {
  let views = 0; // a plain local: starts at 0 on every call
  views++;
  log(`  ProductCard runs (views = ${views})`);
  return _jsxs("article", {
    className: "product-card",
    children: [_jsx("h2", {
      children: product.name
    }), _jsx(Price, {
      cents: product.priceCents
    })]
  });
}
// #endregion

const tick = () => new Promise(r => setTimeout(r, 30));
export async function mount(root, scenario) {
  const product = products[0];
  const reactRoot = createRoot(root);
  if (scenario === 'called') {
    // #region called
    log('1. building elements');
    const element = _jsx("div", {
      children: Price({
        cents: product.priceCents
      })
    });
    log('2. elements built, calling render()');
    reactRoot.render(element);
    // #endregion
    await tick();
    log('3. on screen');
    return;
  }
  if (scenario === 'element') {
    // #region element
    log('1. building elements');
    const element = _jsx("div", {
      children: createElement(Price, {
        cents: product.priceCents
      })
    });
    log('2. elements built, calling render()');
    reactRoot.render(element);
    // #endregion
    await tick();
    log('3. on screen');
    return;
  }

  // default: render the card three times
  for (const n of [1, 2, 3]) {
    log(`render #${n}`);
    reactRoot.render(_jsx(ProductCard, {
      product: product
    }));
    await tick();
  }
}
