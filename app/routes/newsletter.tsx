import type { ActionFunction } from "@remix-run/node";
import { Form, Link, useActionData, useTransition } from "@remix-run/react";
import { useEffect, useRef } from "react";

export let action: ActionFunction = async ({ request }) => {
  let formData = await request.formData();
  let email = formData.get("email");
  
  const API_KEY = process.env.CONVERTKIT_KEY;
  const FORM_ID = "3620052";
  const API = "https://api.convertkit.com/v3";

  const res = await fetch(`${API}/forms/${FORM_ID}/subscribe`, {
    method: "post",
    body: JSON.stringify({ email, api_key: API_KEY}),
    headers: {
      "Content-Type": "application/json; char-set:utf-8",
    },
  });

  return res.json();
};

export default function NewsLetter() {
  let actionData = useActionData();
  // { error, message }
  let transition = useTransition();
  let state: "idle" | "error" | "success" | "submitting" = transition.submission ? "submitting"
    : actionData?.subscription ? "success"
    : actionData?.error ? "error"
    : "idle";

  let inputRef = useRef<HTMLInputElement>(null);
  let succesRef = useRef<HTMLHeadingElement>(null);
  let mounted = useRef<boolean>(false)

  useEffect(() => {
    if (state === "error") {
      inputRef.current?.focus();
    }

    if (state === "idle" && mounted.current) {
      inputRef.current?.select();
    }

    if (state === "success") {
      succesRef.current?.focus();
    }

    mounted.current = true;
  }, [state])

  return (
    <main>
      <Form replace method="post" aria-hidden={state === "success"}>
        <h2>Subscribe</h2>
        <p>Don't miss any of the action!</p>
        <fieldset disabled={state === "submitting"}>
          <input 
            aria-label="Email address"
            aria-describedby="error-message"
            ref={inputRef}
            type="email" 
            name="email" 
            placeholder="you@example.com" 
          />
          <button type="submit">
            {state === "submitting" ? "Subscribing....." : "Subscribe"}
          </button>
        </fieldset>
        <p id="error-message">
        {state === "error" ? (
          actionData.message 
        ) : <>&nbsp;</>}
      </p>
      </Form>

      <div aria-hidden={state !== "success"}>
        <h2 ref={succesRef} tabIndex={-1}>You're subscribed!</h2>
        <p>Please check your email to confirm your subscription</p>
        <Link to=".">Start Over</Link>
      </div>
      
    </main>
  )
}