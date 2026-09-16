# FR-20 — Submit the Contact Us form

The site accepts a message through the Contact Us form after the visitor
confirms a browser dialog.

Site reference: TC06.

## Acceptance criteria

- AC-20.1 Given `/contact_us`, then the form offers name, email, subject,
  message and an optional file upload. Only the email field is marked
  required in the markup.
- AC-20.2 Given a filled form, when "Submit" is clicked, then the browser
  shows a `confirm` dialog reading "Press OK to proceed!", and the form is
  only sent once it's accepted. A test must handle the dialog explicitly;
  ignoring it leaves the submission hanging.
- AC-20.3 Given the dialog was accepted, then the page shows "Success!
  Your details have been submitted successfully." and a "Home" button
  linking back to `/`.
