// Lesson 3: the same card in JSX, plus the JSX rules that trip people up.
import { createRoot } from 'react-dom/client';
import { log } from '../../log';
import { products, formatUSD } from '../../data/products';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
export async function mount(root) {
  const product = products[0];

  // #region card
  const element = _jsxs("article", {
    className: "product-card",
    children: [_jsx("h2", {
      children: product.name
    }), _jsx("p", {
      className: "price",
      children: formatUSD(product.priceCents)
    })]
  });
  // #endregion

  // #region stock
  const headphones = products[1]; // stock: 0
  const buggy = _jsx("p", {
    children: headphones.stock && _jsx("span", {
      className: "tag",
      children: "In stock"
    })
  });
  const fixed = _jsx("p", {
    children: headphones.stock > 0 && _jsx("span", {
      className: "tag",
      children: "In stock"
    })
  });
  // #endregion

  // #region spread
  const props = {
    className: 'price',
    title: 'from props'
  };
  const later = _jsx("p", {
    ...props,
    title: "explicit wins"
  });
  const earlier = _jsx("p", {
    title: "explicit loses",
    ...props
  });
  // #endregion

  // #region fragment
  function Details({
    product
  }) {
    return _jsxs(_Fragment, {
      children: [_jsx("dt", {
        children: "Rating"
      }), _jsxs("dd", {
        children: [product.rating, " / 5"]
      })]
    });
  }
  // #endregion

  const r = createRoot(root);
  r.render(_jsxs(_Fragment, {
    children: [element, _jsx("div", {
      id: "buggy",
      children: buggy
    }), _jsx("div", {
      id: "fixed",
      children: fixed
    }), _jsxs("div", {
      id: "spread",
      children: [later, earlier]
    }), _jsx("dl", {
      id: "details",
      children: _jsx(Details, {
        product: product
      })
    })]
  }));
  await new Promise(x => setTimeout(x, 50));
  log('card html:', root.querySelector('article').outerHTML);
  log('stock && → html:', root.querySelector('#buggy').innerHTML);
  log('stock > 0 && → html:', root.querySelector('#fixed').innerHTML);
  log('spread then explicit:', root.querySelector('#spread p:first-child').getAttribute('title'));
  log('explicit then spread:', root.querySelector('#spread p:last-child').getAttribute('title'));
  log('fragment → <dl> children:', [...root.querySelector('#details').children].map(c => c.tagName).join(', '));
}
