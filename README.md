# KTHB Forms

## Angular app för att hantera formulär på KTH Biblioteket

## Build

Bygg projektet med följande kommandon

### Production (environment.prod.ts)
ng build --configuration=production --output-hashing none --base-href /kthbforms/ --output-path=dist/prod
### Ref (environment.ref.ts)
ng build --configuration=ref --output-hashing none --base-href /kthbforms/ --output-path=dist/ref --source-map

### local dev:
ng serve --host 0.0.0.0 --configuration=ref

## Dokumentation

Formulär som byggs upp dynamiskt utifrån JSON-data(i filer/databas)
Formulären postas till en backend som är ett PHP LUMEN-api.

## JSON-exempel
```json
{
  "id": "contact",
  "name": "Kontakta biblioteket",
  "header": {
    "swedish": "Kontakta oss",
    "english": "Contact us"
  },
  "status": "open",
  "description": {
    "open": {
      "swedish": "Har du en fråga eller synpunkt? Kontakta oss genom formuläret nedan. Vi återkommer till dig inom kort.",
      "english": ""
    },
    "closed": {
      "swedish": "Stängt",
      "english": "Closed"
    }
  },
  "posturl": "/webservices/kthbforms/api/v1/contact",
  "loaderurl": "/kthbforms/assets/ajax_loader_blue_512.gif",
  "postresponseinfo" : {
    "header": {
      "swedish": "Tack för din förfrågan.",
      "english": "Thanks for your request."
    },
    "text": {
      "swedish": "Vi kontaktar dig snart.",
      "english": "We will contact you soon."
    }
  },
  "posterrorresponseinfo" : {
    "header": {
      "swedish": "Något gick fel!",
      "english": "Something went wrong!"
    },
    "text": {
      "swedish": "Kontakta bilioteket...",
      "english": "Please contact the library..."
    }
  },
  "emailtoaddressedge": {
    "emailaddress": "tholind@kth.se",
    "name": {
      "swedish": "EDGE",
      "english": "EDGE"
    }
  },
  "emailtobodyedge": {
    "swedish": [
      "<div><p>Fråga till: KTH Biblioteket</p></div>",
      "<div><p>Från: @@name, @@email</p></div>",
      "<div><p><h3>Meddelande/fråga</h3></div>", 
      "<div><p>@@question</p></div>"
    ],
    "english": [
      "<div><p>Question for: KTH Library</p></div>",
      "<div><p>From: @@name, @@email</p></div>",
      "<div><p><h3>Message/Question</h3></div>", 
      "<div><p>@@question</p></div>"
    ]
  },
  "optionalfieldtext": {
    "swedish": "Valfri",
    "english": "Optional"
  },
  "invalidforminfo": {
    "header": {
      "swedish": "Formuläret är inte korrekt ifyllt!",
      "english": "Form not correct!"
    }, 
    "text": {
      "swedish": "Se rödmarkerad text nedan.",
      "english": "Please see text marked as red below"
    }
  },
  "formfields": {
    "contactdetails": {
        "label": {
          "swedish": "Kontaktuppgifter",
          "english": "Contact details"
        },
        "value": "details",
        "type": "grouplabel",
        "enabled": true,
        "validation": {
          "required": {
            "value": true,
            "errormessage": {
              "swedish": "måste fyllas i",
              "english": "is required"
            }
          }
        }
      },
    "name": {
      "label": {
        "swedish": "Namn",
        "english": "Name"
      },
      "value": "",
      "type": "text",
      "isgrouped": true,
      "enabled": true,
      "validation": {
        "required": {
          "value": true,
          "errormessage": {
            "swedish": "måste fyllas i",
            "english": "is required"
          }
        } 
      }
    },
    "email": {
      "label": {
        "swedish": "E-postadress",
        "english": "email address"
      },
      "value": "",
      "type": "text",
      "isgrouped": true,
      "enabled": true,
      "validation": {
        "required": {
          "value": true,
          "errormessage": {
            "swedish": "måste fyllas i",
            "english": "is required"
          }
        },
        "pattern": {
          "value": "^([0-9a-zA-Z]([-._\\w])*@([0-9a-zA-Z][-\\w]*[0-9a-zA-Z]\\.)+[a-zA-Z]{2,9})$",
          "errormessage": {
            "swedish": "måste vara en godkänd e-postadress",
            "english": "must be valid email address"
          }
        }
      }
    },
    "subject": {
      "label": {
        "swedish": "Ämne",
        "english": "Subject"
      },
      "value": "",
      "type": "text",
      "enabled": true,
      "validation": {
        "required": {
          "value": true,
          "errormessage": {
            "swedish": "måste fyllas i",
            "english": "is required"
          }
        } 
      }
    },
    "question": {
      "label": {
        "swedish": "Din fråga eller synpunkt",
        "english": "Your question or feedback"
      },
      "value": "",
      "type": "textarea",
      "enabled": true,
      "validation": {
        "required": {
          "value": true,
          "errormessage": {
            "swedish": "måste fyllas i",
            "english": "is required"
          }
        } 
      }
    }
  }
}
```

