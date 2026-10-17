---
title: "Forms"
slug: "forms"
module: "fundamentals"
order: 6
level: "must"
illus: "plane"
summary: "One seller form submitted three ways: GET leaks the password into the URL, multipart sends the file, a React action does it all for you."
source: "https://react.dev/reference/react-dom/components/form"
---


## In one minute

Forms are mostly a browser feature. When a form is submitted, the browser collects every field with a `name` into **`FormData`** and sends it to the form's `action` URL: by default with **GET**, which puts the fields in the URL. React adds one thing on top: you can pass a **function** as `action`. React then builds the `FormData`, stops the page from navigating, calls your function, and resets the form afterwards.

**You'll be able to:** pick the right `method` and `encType`, explain what each one changes, and use a React form action instead of `onSubmit` + `preventDefault`.

<figure class="fig anim fig-fund-submit-anim anim-code" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Default (GET)</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">POST + multipart</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="2" aria-selected="false">React action</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;&lt;button type=\&quot;submit\&quot;&gt;Create store&lt;/button&gt;&quot;,&quot;say&quot;:&quot;Clicking a &lt;code&gt;type=\&quot;submit\&quot;&lt;/code&gt; button submits its form.&quot;,&quot;set&quot;:{&quot;L4&quot;:&quot;hl&quot;,&quot;s-click&quot;:&quot;upd&quot;},&quot;txt&quot;:{}},{&quot;fn&quot;:&quot;&lt;input name=\&quot;storeName\&quot; /&gt;&quot;,&quot;say&quot;:&quot;The browser collects every field that has a &lt;code&gt;name&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;L4&quot;:&quot;&quot;,&quot;s-click&quot;:&quot;&quot;,&quot;L1&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;fn&quot;:&quot;&lt;form action=\&quot;/submitted.html\&quot;&gt;&quot;,&quot;say&quot;:&quot;With the default method (&lt;code&gt;GET&lt;/code&gt;), the fields go into the &lt;b&gt;URL&lt;/b&gt;. Recorded: &lt;code&gt;?storeName=…&amp;amp;password=hunter2&amp;amp;logo=logo.svg&lt;/code&gt;. The password is now in the browser history, and the file is only its name.&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;&quot;,&quot;L0&quot;:&quot;hl&quot;,&quot;s-req&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;s-req&quot;:&quot;GET /submitted.html?…&amp;amp;password=hunter2&amp;amp;logo=logo.svg&quot;}},{&quot;say&quot;:&quot;The browser leaves the page: a full page load.&quot;,&quot;set&quot;:{&quot;L0&quot;:&quot;&quot;,&quot;s-req&quot;:&quot;&quot;,&quot;s-page&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;s-page&quot;:&quot;Page: submitted.html (new page)&quot;}}]" data-intro="A form with only an &lt;code&gt;action&lt;/code&gt; URL."><div class="anim-scn-title">Default (GET)</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">SellerForm.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">form</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> action</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"/submitted.html"</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">input</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> name</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"storeName"</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">input</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> name</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"password"</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> type</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"password"</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">input</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> name</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"logo"</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> type</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"file"</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">button</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> type</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"submit"</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">Create store</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">button</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">form</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-button" data-k="s-click">Create store</div><div class="an ca-item ca-box" data-k="s-req">Request: –</div><div class="an ca-item ca-muted" data-k="s-page">Page: the form</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>&lt;button type="submit"&gt;Create store&lt;/button&gt;</code><span>Clicking a <code>type="submit"</code> button submits its form.</span></li><li><code>&lt;input name="storeName" /&gt;</code><span>The browser collects every field that has a <code>name</code>.</span></li><li><code>&lt;form action="/submitted.html"&gt;</code><span>With the default method (<code>GET</code>), the fields go into the <b>URL</b>. Recorded: <code>?storeName=…&amp;password=hunter2&amp;logo=logo.svg</code>. The password is now in the browser history, and the file is only its name.</span></li><li><span>The browser leaves the page: a full page load.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;&lt;button type=\&quot;submit\&quot;&gt;Create store&lt;/button&gt;&quot;,&quot;say&quot;:&quot;The same click.&quot;,&quot;set&quot;:{&quot;L5&quot;:&quot;hl&quot;,&quot;s-click&quot;:&quot;upd&quot;},&quot;txt&quot;:{}},{&quot;fn&quot;:&quot;method=\&quot;POST\&quot; encType=\&quot;multipart/form-data\&quot;&gt;&quot;,&quot;say&quot;:&quot;&lt;code&gt;POST&lt;/code&gt; puts the fields in the request &lt;b&gt;body&lt;/b&gt;, and &lt;code&gt;multipart/form-data&lt;/code&gt; sends each field as a part, including the file’s real bytes. Recorded: the server received the SVG.&quot;,&quot;set&quot;:{&quot;L5&quot;:&quot;&quot;,&quot;s-click&quot;:&quot;&quot;,&quot;L1&quot;:&quot;hl&quot;,&quot;s-req&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;s-req&quot;:&quot;POST body: storeName · password · logo.svg (file bytes)&quot;}},{&quot;say&quot;:&quot;Still a full page load, unless you stop it with &lt;code&gt;event.preventDefault()&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;&quot;,&quot;s-req&quot;:&quot;&quot;,&quot;s-page&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;s-page&quot;:&quot;Page: submitted.html (new page)&quot;}}]" data-intro="&lt;code&gt;method=&quot;POST&quot;&lt;/code&gt; and &lt;code&gt;encType=&quot;multipart/form-data&quot;&lt;/code&gt;."><div class="anim-scn-title">POST + multipart</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">SellerForm.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">form</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> action</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"/submitted.html"</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF">  method</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"POST"</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> encType</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"multipart/form-data"</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">input</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> name</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"storeName"</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">input</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> name</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"password"</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> type</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"password"</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">input</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> name</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"logo"</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> type</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"file"</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">button</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> type</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"submit"</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">Create store</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">button</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">form</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-button" data-k="s-click">Create store</div><div class="an ca-item ca-box" data-k="s-req">Request: –</div><div class="an ca-item ca-muted" data-k="s-page">Page: the form</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>&lt;button type="submit"&gt;Create store&lt;/button&gt;</code><span>The same click.</span></li><li><code>method="POST" encType="multipart/form-data"&gt;</code><span><code>POST</code> puts the fields in the request <b>body</b>, and <code>multipart/form-data</code> sends each field as a part, including the file’s real bytes. Recorded: the server received the SVG.</span></li><li><span>Still a full page load, unless you stop it with <code>event.preventDefault()</code>.</span></li></ol></div><div class="anim-scn" data-anim-scn="2" hidden data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;&lt;button type=\&quot;submit\&quot;&gt;Create store&lt;/button&gt;&quot;,&quot;say&quot;:&quot;The same click.&quot;,&quot;set&quot;:{&quot;L8&quot;:&quot;hl&quot;,&quot;s-click&quot;:&quot;upd&quot;},&quot;txt&quot;:{}},{&quot;fn&quot;:&quot;&lt;form action={createStore}&gt;&quot;,&quot;say&quot;:&quot;React builds the &lt;code&gt;FormData&lt;/code&gt;, prevents the navigation, and calls your function.&quot;,&quot;set&quot;:{&quot;L8&quot;:&quot;&quot;,&quot;s-click&quot;:&quot;&quot;,&quot;L4&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;fn&quot;:&quot;log('action received:', Object.fromEntries(formData))&quot;,&quot;say&quot;:&quot;Recorded: &lt;code&gt;action received: { storeName: \&quot;Mugs &amp;amp; More\&quot;, … }&lt;/code&gt;. No request was sent by the browser.&quot;,&quot;set&quot;:{&quot;L4&quot;:&quot;&quot;,&quot;L1&quot;:&quot;hl&quot;,&quot;s-req&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;s-req&quot;:&quot;No request: your function ran&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;say&quot;:&quot;Afterwards React resets the uncontrolled fields. Recorded: the store-name input was empty after submitting, and the URL didn’t change.&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;&quot;,&quot;s-req&quot;:&quot;&quot;,&quot;s-page&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;s-page&quot;:&quot;Page: the same form, fields cleared&quot;}}]" data-intro="A function as the &lt;code&gt;action&lt;/code&gt;."><div class="anim-scn-title">React action</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">SellerForm.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> createStore</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">formData</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#DF8E1D;--shiki-light-font-style:italic;--shiki-dark:#F9E2AF;--shiki-dark-font-style:italic"> FormData</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">  log</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">'action received:'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> Object</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">fromEntries</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(formData))</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">form</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> action</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">createStore</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">input</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> name</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"storeName"</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">input</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> name</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"password"</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> type</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"password"</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">input</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> name</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"logo"</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> type</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"file"</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">button</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> type</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"submit"</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">Create store</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">button</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">form</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-button" data-k="s-click">Create store</div><div class="an ca-item ca-box" data-k="s-req">Request: –</div><div class="an ca-item ca-muted" data-k="s-page">Page: the form</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>&lt;button type="submit"&gt;Create store&lt;/button&gt;</code><span>The same click.</span></li><li><code>&lt;form action={createStore}&gt;</code><span>React builds the <code>FormData</code>, prevents the navigation, and calls your function.</span></li><li><code>log('action received:', Object.fromEntries(formData))</code><span>Recorded: <code>action received: { storeName: "Mugs &amp; More", … }</code>. No request was sent by the browser.</span></li><li><span class="anim-phase ph-commit">commit phase</span><span>Afterwards React resets the uncontrolled fields. Recorded: the store-name input was empty after submitting, and the URL didn’t change.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>The same “Become a seller” form submitted three ways (all three recorded).</figcaption></figure>

## The example: "Become a seller"

The product store lets people open their own store. All four lessons share the same fields:

```tsx
<label htmlFor="store">Store name</label>
<input id="store" name="storeName" type="text" />
<label htmlFor="email">Email</label>
<input id="email" name="email" type="email" />
<label htmlFor="password">Password</label>
<input id="password" name="password" type="password" />
<label htmlFor="logo">Logo</label>
<input id="logo" name="logo" type="file" accept="image/*" />
<button type="submit">Create store</button>
```

The recorder typed "Mugs & More", `sam@example.com`, `hunter2` and attached `logo.svg`, then submitted each version.

### 1. The default: GET

```tsx
r.render(
	<form action="/submitted.html">
		<Fields />
	</form>,
)
```

The address the browser navigated to:

```text
/submitted.html?storeName=Mugs+%26+More&email=sam%40example.com&password=hunter2&logo=logo.svg
```

Every field is in the URL, **including the password**: it ends up in browser history, server logs and analytics. And the file is only its name.

### 2. POST, but without an encoding

`method="POST"` moves the fields into the request body. What the server received:

```js
{
  "contentType": "application/x-www-form-urlencoded",
  "body": "storeName=Mugs+%26+More&email=sam%40example.com&password=hunter2&logo=logo.svg",
  "containsFileBytes": false
}
```

The password left the URL, but the default encoding (`application/x-www-form-urlencoded`) can only send text, so the file is still just `logo.svg`.

### 3. POST + `multipart/form-data`

```tsx
r.render(
	<form action="/submitted.html" method="POST" encType="multipart/form-data">
		<Fields />
	</form>,
)
```

```text
------boundary
Content-Disposition: form-data; name="storeName"

Mugs & More
------boundary
Content-Disposition: form-data; name="email"

sam@example.com
------boundary
Content-Disposition: form-data; name="password"

hunter2
------boundary
Content-Disposition: form-data; name="logo"; filename="logo.svg"
Content-Type: image/svg+xml

<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="#cba6f7"/></svg>

------boundary
```

Each field is a separate part, and the logo's actual bytes (the SVG) are in the body. All three versions still **reload the page**; with plain `onSubmit` you'd call `event.preventDefault()` and build `new FormData(event.currentTarget)` yourself.

### 4. A React action

```tsx
function createStore(formData: FormData) {
	const { password, logo, ...rest } = Object.fromEntries(formData)
	log('action received:', { ...rest, password: password ? '(hidden)' : '', logo: (logo as File).name })
}

r.render(
	<form action={createStore}>
		<Fields />
	</form>,
)
```

```text
action received: {"storeName":"Mugs & More","email":"sam@example.com","password":"(hidden)","logo":"logo.svg"}
```

The URL didn't change (`sameUrl: true`) and the store-name field was empty afterwards: React reset the form. No `preventDefault`, no `new FormData`. A function `action` can also be `async`, and React 19's `useActionState` and `useFormStatus` build on it to show pending states and results (covered in the Suspense module).

## How it works

- **Only named fields are sent.** No `name`, no entry in `FormData`.
- **`method`**: `GET` (default) → fields in the URL; `POST` → fields in the body.
- **`encType`**: `application/x-www-form-urlencoded` (default, text only) or `multipart/form-data` (needed for files).
- **A function `action` is React-only.** HTML attributes are strings; React intercepts the submit when you pass a function.
- **Labels matter.** `htmlFor`/`id` (or wrapping the input in the `<label>`) gives the input an accessible name and a bigger click target.
- **Give every button a `type`.** A `<button>` inside a form defaults to `type="submit"`.

## Common mistakes

- Leaving login or signup forms on GET.
- Uploading files without `encType="multipart/form-data"` and receiving only file names.
- `onSubmit` without `event.preventDefault()`: the page reloads and your state is lost.
- Untyped buttons (`<button>Show password</button>`) submitting the form.

## Interview Q&A

<details class="qa"><summary>Why not leave a form on the default GET method?</summary>

GET serializes every field into the URL. The recording navigated to `…&password=hunter2&logo=logo.svg`: the password is now in the history and in server logs. POST puts fields in the request body.

</details>

<details class="qa"><summary>Why do file uploads need <code>encType="multipart/form-data"</code>?</summary>

The default encoding can only carry text, so a file input is sent as its file name (`logo=logo.svg` in the recorded POST body). Multipart sends each field as its own part, including the file's bytes; the server received the SVG's contents.

</details>

<details class="qa"><summary>What does passing a function to <code>action</code> do?</summary>

React calls it with the form's `FormData`, prevents the browser's navigation, and resets the form's uncontrolled fields when the action finishes. It replaces the `onSubmit` + `preventDefault` + `new FormData(event.currentTarget)` boilerplate. HTML can't do this: attributes are strings.

</details>

<details class="qa"><summary>How do <code>useActionState</code> and <code>useFormStatus</code> relate to form actions?</summary>

Both build on function actions (React 19). `useActionState` wraps an action and tracks its result and pending state across submissions; `useFormStatus` lets a component inside the form, such as the submit button, read whether the form is submitting, without passing props.

</details>

## Related

- [Inputs](../../fundamentals/inputs/): what each kind of input puts in `FormData`.
- [Error Boundaries](../../fundamentals/error-boundaries/): reporting errors thrown in an action.

## Sources

- react.dev: [`<form>`](https://react.dev/reference/react-dom/components/form), [`useActionState`](https://react.dev/reference/react/useActionState), [`useFormStatus`](https://react.dev/reference/react-dom/hooks/useFormStatus)
- MDN: [Sending form data](https://developer.mozilla.org/en-US/docs/Learn/Forms/Sending_and_retrieving_form_data), [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- Topic order inspired by Kent C. Dodds' EpicReact *React Fundamentals* workshop; the example app and code here are this handbook's own.
