# An extension to read powerlift logs 

This extension helps to read powerlift logs in a more convienient way. Type the session id in the prompt windows, it helps you download automatically and then you'll able to view the logs.

## Features

* Automatically download the powerlift logs to specificied local storage, uncompress and open it.
* Clear the log files in local storage.

## Setup

**Pre-requisite**: Make sure you have the access to Microsoft powerlift and can successfully loggin with Microsoft Edge browser.

The powerlift has strong policies for authentication, for the agent used and for the accessed platform. Please make sure you comply with assgined polices when using this extension.

Powerlift uses cookies for authenticating the user's identity and access, for this extension to work properly, please set up the cookies in the extension settings: 

* Open the Microsoft Edge browser and navigate to `edge://settings/cookies/detail?site=powerlift.acompli.net`.
![Cookies in Edge browser](/images/edge_cookies.png)
If you do not see any cookies, please check if you are logged in the powerlift.

* Copy the content of each cookie to respective settings in extension:
![Set cookies in extension settings](/images/extension-settings.gif)

Then you'll be able to download and open powerlift logs:
* ![Open powerlift logs](/images/usage.gif)

## Extension Settings

This extension contributes the following settings:

* `powerlifter.settings.logStorageLocation`: the path for storing powerlift logs and uncompressed folders, default to the global storage of this extension. (Optional)
* `powerlifter.cookie.session`: the `SESSION` cookie used to access powerlift logs. (Required)
* `powerlifter.cookie.aiAuthuser`: the `aiAuthuser` cookie used to access powerlift logs. (Required)
* `powerlifter.cookie.aiUser`: the  `aiUser` cookie used to access powerlift logs. (Required)

## Disclaimer

This extension is aimed at providing fast access to the powerlift logs for developers, and the cookie data is stored in the settings in plaintext. It is your own risk to protect the cookies from any malicious uses.
