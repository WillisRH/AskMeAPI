# **AskMeAPI Documentation**

## POST /register

> bodies : username, email, password
> create new user

## POST /login

> bodies : username, password
> login function

## GET /session/:id

> Get a session data/info

## GET /user-sessions/:creatorid

> Get a user created sessions

## POST /session

> bodies : question, creator (creator's id)
> Create a new session for a user

## DELETE /session/:id

> Delete a session

## PATCH /new-answer

> bodies : sessionid, answer
> Insert a new answer that submitted for a session

## PATCH /delete-answer

> bodies : sessionid, answerid
> Delete an answer from a session

## GET /user/:id

> Get the user's data

## DELETE /user/:id

> Delete the user's account from db

## PATCH /add-specialuser

> bodies : id (user's id)
> Add a user as a special user

## GET /specialusers

> Get a list of special users

## PATCH /remove-specialuser

> bodies : id (user's id)
> Remove a user from special user list

### Gw juga pusing bikin repo nya, kalo salah yaaa, mohon maklumi
