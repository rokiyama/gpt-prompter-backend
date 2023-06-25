package jwt

import (
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/MicahParks/keyfunc/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/rokiyama/gpt-prompter-backend/functions/message-func/entities"
)

type Parser struct {
	appleJWKS   *keyfunc.JWKS
	issuerApple string
}

func NewParser(appleJWKSetURL string, issuerApple string) *Parser {
	jwks, err := keyfunc.Get(appleJWKSetURL, keyfunc.Options{})
	if err != nil {
		log.Fatalf("Failed to get the JWKS from the given URL.\nError: %s", err)
	}
	return &Parser{
		appleJWKS:   jwks,
		issuerApple: issuerApple,
	}
}

func (p *Parser) Verify(tokenString string, now time.Time) (*entities.ID, error) {
	token, err := jwt.Parse(
		tokenString,
		p.appleJWKS.Keyfunc,
		jwt.WithIssuedAt(),
		jwt.WithIssuer(p.issuerApple),
	)
	if err != nil {
		return nil, fmt.Errorf("jwt parse error: %s", err)
	}
	if !token.Valid {
		return nil, fmt.Errorf("invalid token: token=%#v", token)
	}
	return getClaims(token)
}

func getClaims(token *jwt.Token) (*entities.ID, error) {
	if token == nil {
		return nil, errors.New("token is nil")
	}
	iss, err := token.Claims.GetIssuer()
	if err != nil {
		return nil, fmt.Errorf("cannot get iss: %s", err)
	}
	sub, err := token.Claims.GetSubject()
	if err != nil {
		return nil, fmt.Errorf("cannot get sub: %s", err)
	}
	aud, err := token.Claims.GetAudience()
	if err != nil {
		return nil, fmt.Errorf("cannot get aud: %s", err)
	}
	exp, err := token.Claims.GetExpirationTime()
	if err != nil {
		return nil, fmt.Errorf("cannot get exp: %s", err)
	}
	var expTime time.Time
	if exp != nil {
		expTime = exp.Time
	}
	iat, err := token.Claims.GetIssuedAt()
	if err != nil {
		return nil, fmt.Errorf("cannot get iat: %s", err)
	}
	var iatTime time.Time
	if iat != nil {
		iatTime = iat.Time
	}
	return &entities.ID{
		Issuer:    iss,
		Subject:   sub,
		Audience:  aud,
		ExpiresAt: expTime,
		IssuedAt:  iatTime,
	}, nil
}
