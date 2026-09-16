# FR-14 — The API reports request errors in the response body

The site answers unsupported methods and missing parameters with an error
code in the JSON body, while the HTTP status stays 200.

Site reference: API02, API08, API09.

## Acceptance criteria

Every request below gets HTTP status 200 and a body with the listed
`responseCode` and `message`.

| AC | Request | `responseCode` | `message` |
|---|---|---|---|
| AC-14.1 | `POST /api/productsList` | 405 | `This request method is not supported.` |
| AC-14.2 | `DELETE /api/verifyLogin` | 405 | `This request method is not supported.` |
| AC-14.3 | `POST /api/verifyLogin` with `password` only | 400 | `Bad request, email or password parameter is missing in POST request.` |
| AC-14.4 | `POST /api/createAccount` with `email` only | 400 | `Bad request, name parameter is missing in POST request.` |
| AC-14.5 | `PUT /api/brandsList` | 405 | `This request method is not supported.` |
| AC-14.6 | `POST /api/searchProduct` with no parameter | 400 | `Bad request, search_product parameter is missing in POST request.` |
| AC-14.7 | `GET /api/searchProduct` | 405 | `This request method is not supported.` |

Because the HTTP status is always 200, a test that checks only the status
passes on every one of these errors. API tests assert `responseCode`
(see [`TESTING.md`](../../../TESTING.md#assertions)).
