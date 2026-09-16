# FR-01 — Register a new account

The site creates an account when a visitor completes signup with an email
that isn't registered yet, through the signup wizard or through
`POST /api/createAccount`.

Site reference: TC01, API11, API14.

## Acceptance criteria

- AC-01.1 Given a logged-out visitor on `/login`, when they submit a name
  and an unregistered email under "New User Signup!", then `/signup` shows
  "Enter Account Information" with the name pre-filled and the email
  pre-filled and disabled.
- AC-01.2 Given the account information form with every required field
  filled (password, first name, last name, address, country, state, city,
  zipcode, mobile number), when "Create Account" is submitted, then
  `/account_created` shows "Account Created!".
- AC-01.3 Given the "Account Created!" page, when "Continue" is clicked,
  then the home page shows "Logged in as <name>".
- AC-01.4 Given an unregistered email, when `POST /api/createAccount` is
  sent with every account field, then the body is
  `{"responseCode": 201, "message": "User created!"}`.
- AC-01.5 Given an account created through the API, when
  `GET /api/getUserDetailByEmail?email=<email>` is sent, then
  `responseCode` is 200 and `user` holds the submitted values. Some field
  names differ from the request: `firstname` → `first_name`,
  `lastname` → `last_name`, `birth_date` → `birth_day`.
- AC-01.6 Given an email with no account, when
  `GET /api/getUserDetailByEmail` is sent for it, then the body is
  `{"responseCode": 404, "message": "Account not found with this email, try another email!"}`.
  This is how a test proves an account doesn't exist, or no longer does.
