# api-order

Cette API fournit des points d'accès pour gérer les commandes.

## Créer une commande
```
Endpoint: /api/v1/customers/:customer_id
Méthode: POST
Paramètres:
  - customer_id : L'id de l'utilisateur

Retourne:
  - { success : (boolean) Etat de la requete,
      data: (string) Stripe session url 
    }

```

## Récupère toutes les commandes (Admin)

```
Endpoint: /api/v1/orders
Méthode: GET

Retourne:
  - { success : (boolean) Etat de la requete,
      data: (array) La réponse de la requête API contenant la liste de toutes les commandes.
    }
```

## Récupère une commande par son identifiant. (Admin)
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

## Demande de remboursement
```
Endpoint: /api/v1/customers/:customer_id/orders/:order_id/refund

Méthode: POST

Paramètres:
  - customer_id : L'id de l'utilisateur
  - order_id : L'identifiant de la commande à récupérer.

Retourne:
  - { success : (boolean) Etat de la requete,
      data: (string) Message de confirmation 
    }
```

## Valider le remboursement (Admin)

```
Endpoint: /api/v1/customers/:customer_id/orders/:order_id/refunded

Méthode: POST

Paramètres:
  - customer_id : L'id de l'utilisateur
  - order_id : L'identifiant de la commande à récupérer.

Retourne:
  - { success : (boolean) Etat de la requete,
      data: (object) Le payment intent 
    }
```