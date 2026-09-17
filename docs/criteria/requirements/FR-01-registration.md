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
  `responseCode` is 200 and `user` holds every submitted profile field,
  under the names listed in [Account fields](#account-fields). The mobile
  number is the one exception: it is never returned, under any name, though
  it is still stored — checkout shows it with the delivery address
  ([AC-10.2](FR-10-place-order.md)).
- AC-01.6 Given an email with no account, when
  `GET /api/getUserDetailByEmail` is sent for it, then the body is
  `{"responseCode": 404, "message": "Account not found with this email, try another email!"}`.
  This is how a test proves an account doesn't exist, or no longer does.

## Account fields

The API writes an account under one set of names and reads it back under
another. That is the site's design, not a naming choice in this suite: the
request names are the ones the site's
[API list](https://automationexercise.com/api_list) documents, and
`createAccount` rejects the response names for required fields —
`first_name` in place of `firstname` is a 400. The response names aren't
documented anywhere; they are what the live site returns. Names that differ
between the two are in bold.

| Field | Sent to `createAccount` and `updateAccount` as | Returned by `getUserDetailByEmail` as |
|---|---|---|
| Name | `name` | `name` |
| Email | `email` | `email` |
| Password | `password` | — the login credential, not profile data |
| Title | `title` | `title` |
| Day of birth | **`birth_date`** | **`birth_day`** |
| Month of birth | `birth_month` | `birth_month` |
| Year of birth | `birth_year` | `birth_year` |
| First name | **`firstname`** | **`first_name`** |
| Last name | **`lastname`** | **`last_name`** |
| Company | `company` | `company` |
| Address | `address1` | `address1` |
| Address, second line | `address2` | `address2` |
| Country | `country` | `country` |
| Zipcode | `zipcode` | `zipcode` |
| State | `state` | `state` |
| City | `city` | `city` |
| Mobile number | `mobile_number` | — never returned |

An optional field sent under any other name is ignored without an error:
`birth_day` in place of `birth_date` still creates the account, with an
empty birthday. Only reading the account back shows the loss, which is what
AC-01.5 is for.
