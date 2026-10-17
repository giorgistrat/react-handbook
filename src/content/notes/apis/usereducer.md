---
title: "useReducer"
slug: "usereducer"
module: "apis"
order: 0
level: "must"
illus: "diff"
summary: "A cart as one pure reducer with typed actions: dispatch, lazy init, testing without React, and when React bails out."
source: "https://react.dev/reference/react/useReducer"
---


## In one minute

`useReducer` moves update logic out of event handlers into one pure function:

```ts
const [state, dispatch] = useReducer(reducer, initialArg, init?)
```

Handlers `dispatch` a plain **action** object that says *what happened* (`{ type: 'added', id }`). The **reducer** `(state, action) => newState` decides *how the state changes*. Because the reducer is a plain function, you can test it without React. And because `dispatch` never changes, you can pass it down without breaking `memo`.

**You'll be able to:** model a cart as typed actions plus a reducer, wrap it in a custom hook, and explain what React does when the reducer returns the same state.

<figure class="fig anim fig-apis-reducer-anim anim-code" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Add mug</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">Remove what isn’t there</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;dispatch({ type: 'added', id: 'p1' })   // mug&quot;,&quot;say&quot;:&quot;The shopper clicks &lt;b&gt;Add mug&lt;/b&gt;. The handler doesn’t change anything itself: it only &lt;b&gt;dispatches an action&lt;/b&gt;, a plain object that says what happened.&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;hl&quot;,&quot;s-add&quot;:&quot;upd&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;case 'added':&quot;,&quot;say&quot;:&quot;React calls &lt;b&gt;your reducer&lt;/b&gt; with the current state and that action. The &lt;code&gt;'added'&lt;/code&gt; case returns a &lt;b&gt;new&lt;/b&gt; object.&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;&quot;,&quot;s-add&quot;:&quot;&quot;,&quot;L15&quot;:&quot;hl&quot;,&quot;L16&quot;:&quot;hl&quot;,&quot;r-Cart&quot;:&quot;run&quot;,&quot;r-FreeShippingNote&quot;:&quot;&quot;,&quot;r-CartButtons&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;r-Cart&quot;:&quot;ran&quot;,&quot;r-FreeShippingNote&quot;:&quot;–&quot;,&quot;r-CartButtons&quot;:&quot;–&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;useReducer(cartReducer, initial)&quot;,&quot;say&quot;:&quot;The new state isn’t the same object as the old one, so &lt;code&gt;Cart&lt;/code&gt; renders with it, and so does its child &lt;code&gt;FreeShippingNote&lt;/code&gt;. &lt;code&gt;CartButtons&lt;/code&gt; is skipped: it’s &lt;code&gt;memo&lt;/code&gt;, and &lt;code&gt;dispatch&lt;/code&gt; is the same function on every render.&quot;,&quot;set&quot;:{&quot;L15&quot;:&quot;&quot;,&quot;L16&quot;:&quot;&quot;,&quot;L6&quot;:&quot;hl&quot;,&quot;r-Cart&quot;:&quot;run&quot;,&quot;r-FreeShippingNote&quot;:&quot;run&quot;,&quot;r-CartButtons&quot;:&quot;skip&quot;},&quot;txt&quot;:{&quot;r-Cart&quot;:&quot;ran&quot;,&quot;r-FreeShippingNote&quot;:&quot;ran&quot;,&quot;r-CartButtons&quot;:&quot;skipped&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;say&quot;:&quot;React updates the page. Recorded: &lt;code&gt;Cart render: 1 items, $18.00&lt;/code&gt;, then &lt;code&gt;FreeShippingNote render&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;L6&quot;:&quot;&quot;,&quot;s-total&quot;:&quot;ok&quot;,&quot;s-ship&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;s-total&quot;:&quot;Cart: 1 item · $18.00&quot;,&quot;s-ship&quot;:&quot;$32.00 to free shipping&quot;}}]" data-intro="An action that changes the cart. Press &lt;b&gt;Play&lt;/b&gt; or step with the arrows."><div class="anim-scn-title">Add mug</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">cart.tsx (simplified)</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#9399B2;--shiki-dark-font-style:italic">// CartButtons (a memo component), on click:</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">dispatch</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> type</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'added'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> id</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'p1'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> }</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)   </span><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#9399B2;--shiki-dark-font-style:italic">// mug</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">dispatch</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> type</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'removed'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> id</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'p3'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> }</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">) </span><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#9399B2;--shiki-dark-font-style:italic">// backpack</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> Cart</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">cart</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> dispatch</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">    useReducer</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(cartReducer</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> initial)</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;></span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">FreeShippingNote</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> total</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">total</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(cart)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">CartButtons</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> dispatch</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">dispatch</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;/></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L11"><span class="ca-num">12</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L12"><span class="ca-num">13</span></span><span class="line an ca-line" data-k="L13"><span class="ca-num">14</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> cartReducer</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">state</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> action</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L14"><span class="ca-num">15</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  switch</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (action</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">type) </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span></span><span class="line an ca-line" data-k="L15"><span class="ca-num">16</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">    case</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'added'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">:</span></span><span class="line an ca-line" data-k="L16"><span class="ca-num">17</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">      return</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> items</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> [</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">...</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">state</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">items</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> newItem] </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L17"><span class="ca-num">18</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">    case</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'removed'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">:</span></span><span class="line an ca-line" data-k="L18"><span class="ca-num">19</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">      if</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">!</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">inCart</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(state</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> action</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">id)) </span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> state</span></span><span class="line an ca-line" data-k="L19"><span class="ca-num">20</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">      return</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> items</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> without</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(state</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> action</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">id) </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L20"><span class="ca-num">21</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">  }</span></span><span class="line an ca-line" data-k="L21"><span class="ca-num">22</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-text" data-k="s-total">Cart: 0 items · $0.00</div><div class="an ca-item ca-button" data-k="s-add">Add mug</div><div class="an ca-item ca-button" data-k="s-remove">Remove backpack</div><div class="an ca-item ca-muted" data-k="s-ship">$50.00 to free shipping</div></div><div class="ca-renders"><div class="ca-title">Rendered this step</div><div class="ca-r"><span class="ca-rname">Cart</span><span class="an ca-rstate" data-k="r-Cart">–</span></div><div class="ca-r"><span class="ca-rname">FreeShippingNote</span><span class="an ca-rstate" data-k="r-FreeShippingNote">–</span></div><div class="ca-r"><span class="ca-rname">CartButtons (memo)</span><span class="an ca-rstate" data-k="r-CartButtons">–</span></div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>dispatch({ type: 'added', id: 'p1' })   // mug</code><span>The shopper clicks <b>Add mug</b>. The handler doesn’t change anything itself: it only <b>dispatches an action</b>, a plain object that says what happened.</span></li><li><span class="anim-phase ph-render">render phase</span><code>case 'added':</code><span>React calls <b>your reducer</b> with the current state and that action. The <code>'added'</code> case returns a <b>new</b> object.</span></li><li><span class="anim-phase ph-render">render phase</span><code>useReducer(cartReducer, initial)</code><span>The new state isn’t the same object as the old one, so <code>Cart</code> renders with it, and so does its child <code>FreeShippingNote</code>. <code>CartButtons</code> is skipped: it’s <code>memo</code>, and <code>dispatch</code> is the same function on every render.</span></li><li><span class="anim-phase ph-commit">commit phase</span><span>React updates the page. Recorded: <code>Cart render: 1 items, $18.00</code>, then <code>FreeShippingNote render</code>.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;dispatch({ type: 'removed', id: 'p3' }) // backpack&quot;,&quot;say&quot;:&quot;The shopper clicks &lt;b&gt;Remove backpack&lt;/b&gt;, but the cart has no backpack.&quot;,&quot;set&quot;:{&quot;L2&quot;:&quot;hl&quot;,&quot;s-remove&quot;:&quot;upd&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;if (!inCart(state, action.id)) return state&quot;,&quot;say&quot;:&quot;The &lt;code&gt;'removed'&lt;/code&gt; case finds nothing to remove and returns &lt;code&gt;state&lt;/code&gt; itself: the &lt;b&gt;same object&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;L2&quot;:&quot;&quot;,&quot;s-remove&quot;:&quot;&quot;,&quot;L18&quot;:&quot;hl&quot;,&quot;r-Cart&quot;:&quot;run&quot;,&quot;r-FreeShippingNote&quot;:&quot;&quot;,&quot;r-CartButtons&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;r-Cart&quot;:&quot;ran&quot;,&quot;r-FreeShippingNote&quot;:&quot;–&quot;,&quot;r-CartButtons&quot;:&quot;–&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;useReducer(cartReducer, initial)&quot;,&quot;say&quot;:&quot;&lt;code&gt;Cart&lt;/code&gt; has already run (React runs the reducer while rendering it). Now React sees the same state object and &lt;b&gt;bails out&lt;/b&gt;: no children render.&quot;,&quot;set&quot;:{&quot;L18&quot;:&quot;&quot;,&quot;L6&quot;:&quot;hl&quot;,&quot;r-Cart&quot;:&quot;bail&quot;,&quot;r-FreeShippingNote&quot;:&quot;skip&quot;,&quot;r-CartButtons&quot;:&quot;skip&quot;},&quot;txt&quot;:{&quot;r-Cart&quot;:&quot;bailed out&quot;,&quot;r-FreeShippingNote&quot;:&quot;skipped&quot;,&quot;r-CartButtons&quot;:&quot;skipped&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;say&quot;:&quot;Nothing changes on the page. Recorded: only &lt;code&gt;Cart render&lt;/code&gt; was logged, no &lt;code&gt;FreeShippingNote render&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;L6&quot;:&quot;&quot;},&quot;txt&quot;:{}}]" data-intro="An action that changes nothing: there’s no backpack in the cart."><div class="anim-scn-title">Remove what isn’t there</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">cart.tsx (simplified)</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#9399B2;--shiki-dark-font-style:italic">// CartButtons (a memo component), on click:</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">dispatch</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> type</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'added'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> id</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'p1'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> }</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)   </span><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#9399B2;--shiki-dark-font-style:italic">// mug</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">dispatch</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> type</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'removed'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> id</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'p3'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> }</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">) </span><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#9399B2;--shiki-dark-font-style:italic">// backpack</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> Cart</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">cart</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> dispatch</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">    useReducer</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(cartReducer</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> initial)</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;></span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">FreeShippingNote</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> total</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">total</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(cart)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">CartButtons</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> dispatch</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">dispatch</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;/></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L11"><span class="ca-num">12</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L12"><span class="ca-num">13</span></span><span class="line an ca-line" data-k="L13"><span class="ca-num">14</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> cartReducer</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">state</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> action</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L14"><span class="ca-num">15</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  switch</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (action</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">type) </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span></span><span class="line an ca-line" data-k="L15"><span class="ca-num">16</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">    case</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'added'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">:</span></span><span class="line an ca-line" data-k="L16"><span class="ca-num">17</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">      return</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> items</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> [</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">...</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">state</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">items</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> newItem] </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L17"><span class="ca-num">18</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">    case</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'removed'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">:</span></span><span class="line an ca-line" data-k="L18"><span class="ca-num">19</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">      if</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">!</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">inCart</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(state</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> action</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">id)) </span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> state</span></span><span class="line an ca-line" data-k="L19"><span class="ca-num">20</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">      return</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> items</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> without</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(state</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> action</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">id) </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L20"><span class="ca-num">21</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">  }</span></span><span class="line an ca-line" data-k="L21"><span class="ca-num">22</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-text" data-k="s-total">Cart: 0 items · $0.00</div><div class="an ca-item ca-button" data-k="s-add">Add mug</div><div class="an ca-item ca-button" data-k="s-remove">Remove backpack</div><div class="an ca-item ca-muted" data-k="s-ship">$50.00 to free shipping</div></div><div class="ca-renders"><div class="ca-title">Rendered this step</div><div class="ca-r"><span class="ca-rname">Cart</span><span class="an ca-rstate" data-k="r-Cart">–</span></div><div class="ca-r"><span class="ca-rname">FreeShippingNote</span><span class="an ca-rstate" data-k="r-FreeShippingNote">–</span></div><div class="ca-r"><span class="ca-rname">CartButtons (memo)</span><span class="an ca-rstate" data-k="r-CartButtons">–</span></div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>dispatch({ type: 'removed', id: 'p3' }) // backpack</code><span>The shopper clicks <b>Remove backpack</b>, but the cart has no backpack.</span></li><li><span class="anim-phase ph-render">render phase</span><code>if (!inCart(state, action.id)) return state</code><span>The <code>'removed'</code> case finds nothing to remove and returns <code>state</code> itself: the <b>same object</b>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>useReducer(cartReducer, initial)</code><span><code>Cart</code> has already run (React runs the reducer while rendering it). Now React sees the same state object and <b>bails out</b>: no children render.</span></li><li><span class="anim-phase ph-commit">commit phase</span><span>Nothing changes on the page. Recorded: only <code>Cart render</code> was logged, no <code>FreeShippingNote render</code>.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>A cart keeps its items in a reducer. Click a button and follow which line runs, what renders and what changes on screen (both runs recorded).</figcaption></figure>

## The example: the cart

The cart supports four things: add a product, remove one, change a quantity, and clear the cart. With `useState`, that's four handlers that each copy and patch the `items` array. With a reducer, it's one `switch`.

### 1. Actions as a TypeScript union

```tsx
type CartItem = { id: string; qty: number }
type CartState = { items: CartItem[] }

type CartAction =
	| { type: 'added'; id: string }
	| { type: 'removed'; id: string }
	| { type: 'quantityChanged'; id: string; qty: number }
	| { type: 'cleared' }
```

Each action has a `type` string, and TypeScript narrows on it. Inside `case 'quantityChanged'`, `action.qty` exists. Inside `case 'cleared'`, it doesn't.

### 2. The reducer

```tsx
function cartReducer(state: CartState, action: CartAction): CartState {
	switch (action.type) {
		case 'added': {
			const inCart = state.items.some((i) => i.id === action.id)
			if (!inCart) return { items: [...state.items, { id: action.id, qty: 1 }] }
			return { items: state.items.map((i) => (i.id === action.id ? { ...i, qty: i.qty + 1 } : i)) }
		}
		case 'removed':
			if (!state.items.some((i) => i.id === action.id)) return state // nothing to do: same object
			return { items: state.items.filter((i) => i.id !== action.id) }
		case 'quantityChanged':
			if (action.qty <= 0) return cartReducer(state, { type: 'removed', id: action.id })
			return { items: state.items.map((i) => (i.id === action.id ? { ...i, qty: action.qty } : i)) }
		case 'cleared':
			return state.items.length ? { items: [] } : state
		default:
			throw new Error(`Unknown action: ${(action as { type: string }).type}`)
	}
}
```

Notice the two `return state` lines. When an action changes nothing, the reducer hands back the **same object**, and that matters below.

### 3. Testing it without React

The reducer is just a function, so call it:

```tsx
const empty: CartState = { items: [] }
const one = cartReducer(empty, { type: 'added', id: 'p1' })
const two = cartReducer(one, { type: 'added', id: 'p1' })
const same = cartReducer(two, { type: 'removed', id: 'p3' })
log('one →', one)
log('two →', two)
log('same === two →', same === two)
log('empty unchanged →', empty)
```

```text
one → {"items":[{"id":"p1","qty":1}]}
two → {"items":[{"id":"p1","qty":2}]}
same === two → true
empty unchanged → {"items":[]}
```

No component and no rendering. `empty` wasn't mutated: every change built a new object.

### 4. A custom hook with lazy initialization

```tsx
function loadCart(key: string): CartState {
	log(`  loadCart("${key}")`)
	const saved = localStorage.getItem(key)
	return saved ? JSON.parse(saved) : { items: [] }
}
```

```tsx
function useCart() {
	const [cart, dispatch] = useReducer(cartReducer, 'cart', loadCart)
	useEffect(() => localStorage.setItem('cart', JSON.stringify(cart)), [cart])
	const count = cart.items.reduce((n, i) => n + i.qty, 0)
	const total = cart.items.reduce((sum, i) => sum + i.qty * byId(i.id).priceCents, 0)
	return { cart, count, total, dispatch }
}
```

The third argument is an **initializer**: React calls `loadCart('cart')` once, on mount. A cart was saved with two lamps, then "Add mug" was clicked twice:

```text
  loadCart("cart")
Cart render: 2 items, $78.00
CartButtons render
FreeShippingNote render
Cart render: 3 items, $96.00
FreeShippingNote render
Cart render: 4 items, $114.00
FreeShippingNote render
```

`loadCart` ran once. Compare calling it yourself:

```tsx
const [cart, dispatch] = useReducer(cartReducer, loadCart('cart'))
```

```text
  loadCart("cart")
Cart render: 2 items, $78.00
CartButtons render
FreeShippingNote render
  loadCart("cart")
Cart render: 3 items, $96.00
FreeShippingNote render
  loadCart("cart")
Cart render: 4 items, $114.00
FreeShippingNote render
```

The result is the same, but `localStorage` is read and parsed on **every render**, and the value is thrown away after the first one.

### 5. The components

```tsx
function Cart({ useCartHook = useCart }) {
	const { cart, count, total, dispatch } = useCartHook()
	log(`Cart render: ${count} items, ${formatUSD(total)}`)
	return (
		<section className="cart">
			<h2 id="summary">
				{count} items · {formatUSD(total)}
			</h2>
			<ul>
				{cart.items.map((i) => (
					<li key={i.id}>
						<span>
							{byId(i.id).name} × {i.qty}
						</span>
						<button onClick={() => dispatch({ type: 'quantityChanged', id: i.id, qty: i.qty - 1 })}>−</button>
					</li>
				))}
			</ul>
			<CartButtons dispatch={dispatch} />
			<FreeShippingNote total={total} />
		</section>
	)
}

function FreeShippingNote({ total }: { total: number }) {
	log('FreeShippingNote render')
	return <p>{total >= 5000 ? 'Free shipping!' : `${formatUSD(5000 - total)} to free shipping`}</p>
}

const CartButtons = memo(function CartButtons({ dispatch }: { dispatch: Dispatch<CartAction> }) {
	log('CartButtons render')
	return (
		<p>
			<button id="add-mug" onClick={() => dispatch({ type: 'added', id: 'p1' })}>Add mug</button>
			<button id="add-lamp" onClick={() => dispatch({ type: 'added', id: 'p4' })}>Add lamp</button>
			<button id="remove-backpack" onClick={() => dispatch({ type: 'removed', id: 'p3' })}>Remove backpack</button>
			<button id="clear" onClick={() => dispatch({ type: 'cleared' })}>Clear</button>
		</p>
	)
})
```

Recorded, click by click. Mount:

```text
  loadCart("cart")
Cart render: 0 items, $0.00
CartButtons render
FreeShippingNote render
```

"Add mug":

```text
Cart render: 1 items, $18.00
FreeShippingNote render
```

"Remove backpack" (no backpack in the cart):

```text
Cart render: 3 items, $75.00
```

"Clear", then "Clear" again:

```text
Cart render: 0 items, $0.00
FreeShippingNote render
```

```text
Cart render: 0 items, $0.00
```

What to notice:

- **`CartButtons` rendered once, on mount.** It's wrapped in `memo`, and its only prop is `dispatch`, which is the same function on every render.
- **When the reducer returned the same object, `Cart` still ran**, but `FreeShippingNote` didn't. React runs the reducer while rendering `Cart`, so it only finds out "nothing changed" after `Cart` has started. It then **bails out**: it skips the children, and nothing on the page changes.
- "Clear" on an empty cart behaved the same way, because the `'cleared'` case returns `state` when there's nothing to clear.

### 6. A typo in an action type

```tsx
dispatch({ type: 'emptied' } as unknown as CartAction)
log('dispatch() returned normally')
```

```text
  loadCart("cart")
dispatch() returned normally
ErrorBoundary caught: Unknown action: emptied
```

`dispatch` itself didn't throw. It only queued the action. The reducer threw while React was rendering, so the **nearest error boundary** caught it ([Error Boundaries](../../fundamentals/error-boundaries/)). The TypeScript union normally prevents this typo; the `as unknown as` cast was needed to get past it.

## How it works

- **`dispatch` queues, the reducer computes.** Each `dispatch(action)` is added to the hook's update queue. On the next render, React runs `reducer(state, action)` for each queued action in order, each one getting the previous result. This is why a reducer never reads stale state (the bug in [useState vs useReducer](../../hooks/usestate-vs-usereducer/)).
- **Same state → bail out.** If the final state is `Object.is`-equal to the old one, React skips the component's children and doesn't commit. Return `state` itself when nothing changes, and a new object only when something does.
- **Reducers must be pure.** No mutation, no `localStorage`, no fetching. In development, Strict Mode calls your reducer twice to catch impure ones. Side effects belong in effects or event handlers.
- **Under the hood**, `useState` is `useReducer` with a built-in reducer, `(state, action) => typeof action === 'function' ? action(state) : action` ([Hooks Under the Hood](../../internals/hooks-under-the-hood/)).

## Common mistakes

- **Mutating state in the reducer** (`state.items.push(…); return state`). It returns the same object, so React bails out and nothing updates.
- **Calling the initializer yourself**: `useReducer(r, loadCart('cart'))` instead of `useReducer(r, 'cart', loadCart)`.
- **Putting side effects in the reducer** (saving, logging to a server). Use an effect, as `useCart` does with `localStorage`.
- **One reducer for unrelated values.** Independent values are simpler as separate `useState`s ([useState vs useReducer](../../hooks/usestate-vs-usereducer/)).

## Interview Q&A

<details class="qa"><summary>What's the signature of <code>useReducer</code>, and what does each part do?</summary>

`const [state, dispatch] = useReducer(reducer, initialArg, init?)`. `reducer(state, action)` returns the next state. `initialArg` is the initial state, or the argument passed to `init`. `dispatch(action)` queues an action for the next render.

</details>

<details class="qa"><summary>When is a reducer better than several <code>useState</code>s?</summary>

When values must change together, or one update depends on another value. A cart with add, remove, change-quantity and clear is a good example: one reducer keeps every transition in one place. Truly independent values are simpler as separate `useState`s.

</details>

<details class="qa"><summary>How do you test a reducer?</summary>

Call it. It's a pure `(state, action) => newState` function, so a test passes a state and an action and checks the result. Recorded: `cartReducer(empty, { type: 'added', id: 'p1' })` returned a cart with one mug, and `empty` was unchanged.

</details>

<details class="qa"><summary>What happens when the reducer returns the same state object?</summary>

React bails out: the children don't render and the page doesn't change. Recorded: "Remove backpack" on a cart without one logged `Cart render` but no `FreeShippingNote render`. The component itself still ran, because React computes reducer state while rendering it.

</details>

<details class="qa"><summary>Why is <code>dispatch</code> useful to pass down?</summary>

It has a stable identity: the same function for the component's whole life. A memoized child that receives only `dispatch` never re-renders because of it. Recorded: `CartButtons` rendered once, on mount.

</details>

<details class="qa"><summary>What's the third argument for?</summary>

A lazy initializer, called once with `initialArg` on mount. Use it for expensive setup like reading `localStorage`. Recorded: `loadCart` ran once over three renders, but on every render when called directly.

</details>

<details class="qa"><summary>How do you get type safety for actions?</summary>

Model them as a discriminated union on `type`. TypeScript narrows `action` in each `case`, so only the fields that action has are available, and a misspelled `type` is a type error.

</details>

## Related

- [useState vs useReducer](../../hooks/usestate-vs-usereducer/): when to choose which, and the stale-closure bug.
- [Building a Cart](../../hooks/building-a-cart/): the same cart built with `useState` updater functions.
- [Context with use](../../apis/context-with-use/): share `dispatch` with distant components.
- [Hooks Under the Hood](../../internals/hooks-under-the-hood/): the update queue both hooks use.

## Sources

- react.dev: [`useReducer`](https://react.dev/reference/react/useReducer), [Extracting state logic into a reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer)
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React APIs* workshop; the example app and code here are this handbook's own.
