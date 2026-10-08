// Lesson 3: the same card in JSX, plus the JSX rules that trip people up.
import { createRoot } from 'react-dom/client';
import { log } from '../../log';
import { products, formatUSD } from '../../data/products';
export async function mount(root) {
  const product = products[0];

  // #region card
  const element = React.createElement("article", {
    className: "product-card"
  }, React.createElement("h2", null, product.name), React.createElement("p", {
    className: "price"
  }, formatUSD(product.priceCents)));
  // #endregion

  // #region stock
  const headphones = products[1]; // stock: 0
  const buggy = React.createElement("p", null, headphones.stock && React.createElement("span", {
    className: "tag"
  }, "In stock"));
  const fixed = React.createElement("p", null, headphones.stock > 0 && React.createElement("span", {
    className: "tag"
  }, "In stock"));
  // #endregion

  // #region spread
  const props = {
    className: 'price',
    title: 'from props'
  };
  const later = React.createElement("p", {
    ...props,
    title: "explicit wins"
  });
  const earlier = React.createElement("p", {
    title: "explicit loses",
    ...props
  });
  // #endregion

  // #region fragment
  function Details({
    product
  }) {
    return React.createElement(React.Fragment, null, React.createElement("dt", null, "Rating"), React.createElement("dd", null, product.rating, " / 5"));
  }
  // #endregion

  const r = createRoot(root);
  r.render(React.createElement(React.Fragment, null, element, React.createElement("div", {
    id: "buggy"
  }, buggy), React.createElement("div", {
    id: "fixed"
  }, fixed), React.createElement("div", {
    id: "spread"
  }, later, earlier), React.createElement("dl", {
    id: "details"
  }, React.createElement(Details, {
    product: product
  }))));
  await new Promise(x => setTimeout(x, 50));
  log('card html:', root.querySelector('article').outerHTML);
  log('stock && → html:', root.querySelector('#buggy').innerHTML);
  log('stock > 0 && → html:', root.querySelector('#fixed').innerHTML);
  log('spread then explicit:', root.querySelector('#spread p:first-child').getAttribute('title'));
  log('explicit then spread:', root.querySelector('#spread p:last-child').getAttribute('title'));
  log('fragment → <dl> children:', [...root.querySelector('#details').children].map(c => c.tagName).join(', '));
}
