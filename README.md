# gpt-prompter

## frontend

### build

```sh
npm ci

# increment ios buildNumber
jq '.expo.ios.buildNumber = (."expo".ios.buildNumber | tonumber + 1 | tostring) | . ' app.json > app_new.json && mv app_new.json app.json

eas build --platform ios --auto-submit
```

## backend

```sh
cdk bootstrap && cdk deploy
```
