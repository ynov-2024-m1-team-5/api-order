# api-order

Cette API fournit des points d'accès pour gérer les commandes.

## Créer une commande
```
Endpoint: /api/v1/orders/:customer_id
Méthode: POST
Paramètres:
  - customer_id : L'id de l'utilisateur

Retourne:
  - { success : (boolean) Etat de la requete,
      data: (string) Le PaymentIntent de stripe
    }

```

## Confirme une commande

```
Endpoint: /api/v1/orders/:customer_id/:order_id
Méthode: PATCH
Paramètres:
  - customer_id : L'id de l'utilisateur
  - order_id : L'identifiant de la commande à confirmer.

Retourne:
  - { success : (boolean) Etat de la requete,
      data: (object) La commande
    }
```

## Récupère toutes les commandes

```
Endpoint: /api/v1/orders
Méthode: GET

Retourne:
  - { success : (boolean) Etat de la requete,
      data: (array) La réponse de la requête API contenant la liste de toutes les commandes.
    }
```

## Récupère une commande par son identifiant en utilisant l'API /api/v1/orders.
```

Endpoint: /api/v1/orders/:order_id
Méthode: GET
Paramètres:
  - order_id : L'identifiant de la commande à récupérer.

Retourne:
  - { success : (boolean) Etat de la requete,
      data: (object) La commande
    }

```
