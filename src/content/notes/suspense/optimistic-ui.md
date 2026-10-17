---
title: "Optimistic UI"
slug: "optimistic-ui"
module: "suspense"
order: 2
level: "must"
illus: "bolt"
summary: "useOptimistic shows a review before the server confirms it; useFormStatus shows the form is busy."
source: "https://react.dev/reference/react/useOptimistic"
---


## In one minute

**Optimistic UI** shows the result of an action before the server confirms it: the review appears in the list the moment you post it, marked "sending…". A `<form action={fn}>` runs `fn` inside a **transition**, and React holds back ordinary state updates made during a transition until it ends, so `useState` can't do this. `useOptimistic` can: its value may change *during* the action, and when the action ends it falls back to the real state, which also gives you **rollback** for free if the request failed. `useFormStatus` lets a button inside the form know the form is submitting. One React 19 catch: a state update after an `await` isn't part of the action any more; wrap it in `startTransition`.

**You'll be able to:** post a form with an optimistic result, show its pending state, roll back on failure, and avoid the after-`await` duplicate.

<figure class="fig anim fig-suspense-optimistic-anim anim-code" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">useState</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">useOptimistic</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="2" aria-selected="false">+ startTransition</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;return &lt;form action={addReview}&gt;… &lt;SubmitButton /&gt;&lt;/form&gt;&quot;,&quot;say&quot;:&quot;Submit. The form action runs inside a transition, and the &lt;code&gt;setReviews&lt;/code&gt; before the request is part of it…&quot;,&quot;set&quot;:{&quot;L7&quot;:&quot;hl&quot;,&quot;L3&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;return &lt;button&gt;{pending ? 'Posting…' : 'Post review'}&lt;/button&gt;&quot;,&quot;say&quot;:&quot;…so React holds it back until the whole action ends. Only the button shows progress, through &lt;code&gt;useFormStatus&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;L7&quot;:&quot;&quot;,&quot;L3&quot;:&quot;&quot;,&quot;L12&quot;:&quot;hl&quot;,&quot;s-btn&quot;:&quot;upd&quot;,&quot;s-list&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;s-btn&quot;:&quot;Posting…&quot;,&quot;s-list&quot;:&quot;Ana: Keeps my tea hot. (no new review yet)&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;const saved = await postReview(formData)&quot;,&quot;say&quot;:&quot;The review appears only when the server answers, 800 ms after clicking.&quot;,&quot;set&quot;:{&quot;L12&quot;:&quot;&quot;,&quot;s-btn&quot;:&quot;upd&quot;,&quot;s-list&quot;:&quot;upd&quot;,&quot;L4&quot;:&quot;hl&quot;},&quot;txt&quot;:{&quot;s-btn&quot;:&quot;Post review&quot;,&quot;s-list&quot;:&quot;Ana · You: Great lamp!&quot;}}]" data-intro="Try to show the review with &lt;code&gt;setReviews&lt;/code&gt; before the request."><div class="anim-scn-title">useState</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">Reviews.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> Reviews</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">reviews</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setReviews</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(initial)</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  async</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> addReview</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">formData</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">    setReviews</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">r</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> [</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">...</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">r</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> temp</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(formData)]) </span><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#9399B2;--shiki-dark-font-style:italic">// show it right away?</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">    const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> saved</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> await</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> postReview</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(formData)</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">    setReviews</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">r</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> [</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">...</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">replaceTemp</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(r)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> saved])</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">  }</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">form</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> action</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">addReview</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">… </span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">SubmitButton</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> />&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">form</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> SubmitButton</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L11"><span class="ca-num">12</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> pending</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> }</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useFormStatus</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">()</span></span><span class="line an ca-line" data-k="L12"><span class="ca-num">13</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">button</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">pending </span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">?</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'Posting…'</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> :</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'Post review'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">button</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L13"><span class="ca-num">14</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-box" data-k="s-list">Ana: Keeps my tea hot.</div><div class="an ca-item ca-button" data-k="s-btn">Post review</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>return &lt;form action={addReview}&gt;… &lt;SubmitButton /&gt;&lt;/form&gt;</code><span>Submit. The form action runs inside a transition, and the <code>setReviews</code> before the request is part of it…</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>return &lt;button&gt;{pending ? 'Posting…' : 'Post review'}&lt;/button&gt;</code><span>…so React holds it back until the whole action ends. Only the button shows progress, through <code>useFormStatus</code>.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>const saved = await postReview(formData)</code><span>The review appears only when the server answers, 800 ms after clicking.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;addOptimistic(formData.get('text'))&quot;,&quot;say&quot;:&quot;An optimistic value is allowed to render &lt;b&gt;during&lt;/b&gt; the transition: the review shows immediately, marked as sending.&quot;,&quot;set&quot;:{&quot;L5&quot;:&quot;hl&quot;,&quot;s-btn&quot;:&quot;upd&quot;,&quot;s-list&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;s-btn&quot;:&quot;Posting…&quot;,&quot;s-list&quot;:&quot;Ana · You: Great lamp! (sending…)&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;setReviews(r =&gt; [...r, saved]) // after an await&quot;,&quot;say&quot;:&quot;The server answers. But a &lt;code&gt;setReviews&lt;/code&gt; after an &lt;code&gt;await&lt;/code&gt; isn’t part of the action any more: it renders on its own while the optimistic copy still exists.&quot;,&quot;set&quot;:{&quot;L5&quot;:&quot;&quot;,&quot;s-btn&quot;:&quot;&quot;,&quot;s-list&quot;:&quot;bad&quot;,&quot;L7&quot;:&quot;hl&quot;},&quot;txt&quot;:{&quot;s-list&quot;:&quot;Ana · You: Great lamp! · You: Great lamp! (sending…)&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;say&quot;:&quot;Recorded: the review appeared twice for a moment, then the action ended and the optimistic value fell back to the real list.&quot;,&quot;set&quot;:{&quot;L7&quot;:&quot;&quot;,&quot;s-list&quot;:&quot;ok&quot;,&quot;s-btn&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;s-btn&quot;:&quot;Post review&quot;,&quot;s-list&quot;:&quot;Ana · You: Great lamp!&quot;}}]" data-intro="An optimistic list, shown during the action."><div class="anim-scn-title">useOptimistic</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">Reviews.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> Reviews</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">reviews</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setReviews</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(initial)</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">shown</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> addOptimistic</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useOptimistic</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(reviews</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">    (</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">current</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> text</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">)</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> [</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">...</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">current</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> text</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> sending</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> true</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> }</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">])</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  async</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> addReview</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">formData</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">    addOptimistic</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(formData</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">get</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">'text'</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">))</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">    const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> saved</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> await</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> postReview</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(formData)</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">    setReviews</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">r</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> [</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">...</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">r</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> saved]) </span><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#9399B2;--shiki-dark-font-style:italic">// after an await</span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">  }</span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">form</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> action</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">addReview</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">…</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">form</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-box" data-k="s-list">Ana: Keeps my tea hot.</div><div class="an ca-item ca-button" data-k="s-btn">Post review</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-commit">commit phase</span><code>addOptimistic(formData.get('text'))</code><span>An optimistic value is allowed to render <b>during</b> the transition: the review shows immediately, marked as sending.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>setReviews(r =&gt; [...r, saved]) // after an await</code><span>The server answers. But a <code>setReviews</code> after an <code>await</code> isn’t part of the action any more: it renders on its own while the optimistic copy still exists.</span></li><li><span class="anim-phase ph-commit">commit phase</span><span>Recorded: the review appeared twice for a moment, then the action ended and the optimistic value fell back to the real list.</span></li></ol></div><div class="anim-scn" data-anim-scn="2" hidden data-steps="[{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;addOptimistic(formData.get('text'))&quot;,&quot;say&quot;:&quot;Shown immediately, as before.&quot;,&quot;set&quot;:{&quot;L5&quot;:&quot;hl&quot;,&quot;s-btn&quot;:&quot;upd&quot;,&quot;s-list&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;s-btn&quot;:&quot;Posting…&quot;,&quot;s-list&quot;:&quot;Ana · You: Great lamp! (sending…)&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;startTransition(() =&gt; setReviews(r =&gt; [...r, saved]))&quot;,&quot;say&quot;:&quot;&lt;code&gt;startTransition&lt;/code&gt; puts the update back into the action. Recorded: the real review replaced the optimistic one in a single step, with no duplicate.&quot;,&quot;set&quot;:{&quot;L5&quot;:&quot;&quot;,&quot;s-btn&quot;:&quot;upd&quot;,&quot;s-list&quot;:&quot;ok&quot;,&quot;L7&quot;:&quot;hl&quot;},&quot;txt&quot;:{&quot;s-btn&quot;:&quot;Post review&quot;,&quot;s-list&quot;:&quot;Ana · You: Great lamp!&quot;}}]" data-intro="The update after the &lt;code&gt;await&lt;/code&gt; wrapped in &lt;code&gt;startTransition&lt;/code&gt;."><div class="anim-scn-title">+ startTransition</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">Reviews.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> Reviews</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">reviews</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setReviews</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(initial)</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">shown</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> addOptimistic</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useOptimistic</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(reviews</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">    (</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">current</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> text</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">)</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> [</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">...</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">current</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> text</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> sending</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> true</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> }</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">])</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  async</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> addReview</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">formData</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">    addOptimistic</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(formData</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">get</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">'text'</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">))</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">    const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> saved</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> await</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> postReview</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(formData)</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">    startTransition</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> setReviews</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">r</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> [</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">...</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">r</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> saved]))</span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">  }</span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">form</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> action</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">addReview</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">…</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">form</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-box" data-k="s-list">Ana: Keeps my tea hot.</div><div class="an ca-item ca-button" data-k="s-btn">Post review</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-commit">commit phase</span><code>addOptimistic(formData.get('text'))</code><span>Shown immediately, as before.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>startTransition(() =&gt; setReviews(r =&gt; [...r, saved]))</code><span><code>startTransition</code> puts the update back into the action. Recorded: the real review replaced the optimistic one in a single step, with no duplicate.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Posting a review “Great lamp!”; the server takes 800 ms (all three versions recorded).</figcaption></figure>

## The example: posting a review

Posting a review takes the server 800 ms. Each recording types "Great lamp!" and clicks "Post review".

### The submit button: useFormStatus

```tsx
function SubmitButton() {
	const { pending } = useFormStatus() // the status of the <form> around this button
	return (
		<button type="submit" disabled={pending} data-note>
			{pending ? 'Posting…' : 'Post review'}
		</button>
	)
}
```

`useFormStatus` reads the status of the `<form>` the component is rendered **inside** (it must be a child of the form, so the button is its own component). It also gives you the submitted `data`, `method` and `action`.

### 1. Plain state

```tsx
function ReviewsWithState() {
	const [reviews, setReviews] = useState(initial)
	async function addReview(formData: FormData) {
		const text = String(formData.get('text'))
		setReviews((r) => [...r, { id: 'temp', author: 'You', text }]) // try to show it right away
		const saved = await postReview('p1', { author: 'You', text })
		setReviews((r) => [...r.filter((x) => x.id !== 'temp'), saved])
	}
	return (
		<>
			<ReviewList reviews={reviews} />
			<form action={addReview}>
				<input name="text" id="text" />
				<SubmitButton />
			</form>
		</>
	)
}
```

```text
1250 ms  → POST /products/p1/reviews
screen: Ana: Keeps my tea hot. · Posting…
2050 ms  ← POST /products/p1/reviews
screen: Ana: Keeps my tea hot. · You: Great lamp! · Posting…
screen: Ana: Keeps my tea hot. · You: Great lamp! · Post review
```

The button said "Posting…" right away, but the review only appeared when the server answered, 800 ms later. The `setReviews` before the `await` was part of the action's transition, so React held it back.

### 2. useOptimistic

```tsx
function Reviews({ fail = false, fixed = false }) {
	const [reviews, setReviews] = useState(initial)
	const [optimisticReviews, addOptimistic] = useOptimistic(reviews, (current, text: string) => [
		...current,
		{ id: 'temp', author: 'You', text, sending: true },
	])

	async function addReview(formData: FormData) {
		const text = String(formData.get('text'))
		addOptimistic(text) // shown immediately, during the action
		try {
			const saved = await postReview('p1', { author: 'You', text }, 800, fail)
			if (fixed) {
				startTransition(() => setReviews((r) => [...r, saved])) // part of the action again
			} else {
				setReviews((r) => [...r, saved]) // after an await: no longer part of the action
			}
		} catch {
			log('action: the server rejected the review')
		}
	}

	return (
		<>
			<ReviewList reviews={optimisticReviews} />
			<form action={addReview}>
				<input name="text" id="text" />
				<SubmitButton />
			</form>
		</>
	)
}
```

```text
1250 ms  → POST /products/p1/reviews
screen: Ana: Keeps my tea hot. · You: Great lamp! (sending…) · Posting…
2050 ms  ← POST /products/p1/reviews
screen: Ana: Keeps my tea hot. · You: Great lamp! · You: Great lamp! (sending…) · Posting…
screen: Ana: Keeps my tea hot. · You: Great lamp! · Post review
```

The review appeared immediately, marked "(sending…)". But when the server answered, the list briefly showed it **twice**: the saved review and the optimistic one. The `setReviews` after the `await` ran as a separate update while the action's optimistic state was still alive. Wrapping it in `startTransition` makes it part of the action again:

```tsx
startTransition(() => setReviews((r) => [...r, saved])) // part of the action again
```

```text
1250 ms  → POST /products/p1/reviews
screen: Ana: Keeps my tea hot. · You: Great lamp! (sending…) · Posting…
2050 ms  ← POST /products/p1/reviews
screen: Ana: Keeps my tea hot. · You: Great lamp! · Post review
```

One step from "sending…" to saved.

### 3. When the server fails

```text
1250 ms  → POST /products/p1/reviews
screen: Ana: Keeps my tea hot. · You: Great lamp! (sending…) · Posting…
2100 ms  ✗ POST /products/p1/reviews: Server error, review not saved
action: the server rejected the review
screen: Ana: Keeps my tea hot. · Post review
```

The optimistic review disappeared on its own when the action ended: the optimistic value fell back to the real list, which never got the review. Show an error message too, so the shopper knows why.

### 4. Several steps in one action

```tsx
function Checkout() {
	const [message, setMessage] = useOptimistic('Place order')
	async function placeOrder() {
		setMessage('Reserving stock…')
		await callApi('POST /orders', 400)
		setMessage('Charging card…')
		await callApi('POST /payments', 400)
	}
	return (
		<form action={placeOrder}>
			<button type="submit" data-note>{message}</button>
		</form>
	)
}
```

```text
1200 ms  → POST /orders
screen: Reserving stock…
1600 ms  ← POST /orders
1600 ms  → POST /payments
screen: Charging card…
2000 ms  ← POST /payments
screen: Place order
```

An optimistic value can change as often as you like during the action, then falls back to "Place order" when it ends.

## How it works

- **Actions are transitions.** A function passed to `<form action>` (or called inside `startTransition`) runs as a transition: its state updates render together when it completes.
- **`useOptimistic(value, reducer?)`** returns `[optimisticValue, setOptimistic]`. Outside an action, `optimisticValue` is just `value`. During one, `setOptimistic` overrides it; when the action ends, it's `value` again, whatever happened.
- **After an `await`, React 19 loses track** of which action an update belongs to (async context isn't preserved yet), so updates after the `await` need their own `startTransition`. React's docs note this limitation.

## Common mistakes

- **`useState` for optimistic results** inside an action (recorded: nothing until the server answered).
- **Updating real state after `await` without `startTransition`** (recorded: a duplicate review).
- **`useFormStatus` in the component that renders the `<form>`.** It only sees forms *above* it.
- **No error message on failure.** The rollback is silent.

## Interview Q&A

<details class="qa"><summary>What is optimistic UI?</summary>

Showing the expected result of an action immediately, before the server confirms it, and correcting it if the server disagrees.

</details>

<details class="qa"><summary>Why doesn't <code>useState</code> work for it inside a form action?</summary>

Form actions run in a transition, and React holds state updates in a transition until it finishes. Recorded: the review appeared only after the 800 ms request.

</details>

<details class="qa"><summary>How does <code>useOptimistic</code> work?</summary>

It returns a value that can be updated during an action and falls back to the real state when the action ends. Recorded: the review showed "(sending…)" immediately.

</details>

<details class="qa"><summary>How do you get rollback on failure?</summary>

Do nothing special: when the action ends, the optimistic value reverts to the real state, which didn't change. Recorded: after a server error the optimistic review disappeared.

</details>

<details class="qa"><summary>Why did the review appear twice for a moment?</summary>

The `setReviews` after `await` wasn't part of the action's transition in React 19, so it rendered while the optimistic copy still existed. Wrapping it in `startTransition` fixed it (recorded).

</details>

<details class="qa"><summary>What does <code>useFormStatus</code> give you?</summary>

`{ pending, data, method, action }` for the form the component is inside, without passing props. It must be called from a child of the `<form>`.

</details>

## Related

- [Forms](../../fundamentals/forms/): form actions and `FormData`.
- [Promise Caching and Transitions](../../suspense/promise-caching/): transitions and `isPending`.

## Sources

- react.dev: [`useOptimistic`](https://react.dev/reference/react/useOptimistic), [`useFormStatus`](https://react.dev/reference/react-dom/hooks/useFormStatus), [`useTransition` (state updates after `await`)](https://react.dev/reference/react/useTransition#react-doesnt-treat-my-state-update-after-await-as-a-transition)
- Topic order inspired by Kent C. Dodds' EpicReact *React Suspense* workshop; the example app and code here are this handbook's own.
