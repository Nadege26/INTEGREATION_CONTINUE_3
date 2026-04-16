**User story :** 

Créer un produit

**Règles métier :** 

le titre ne contient pas d'espace

**Scénarios :** 

- Création réussie : 

Quand je créé un produit avec : 

- titre : "test"
- prix : 200
- description : "blalblablalb"

Alors le produit est créé
Et j'ai un message "produit créé"

- Création échouée : titre contient un espace

Quand je créé un produit avec :

- titre : " switch"
- prix : 200
- description : "nouvelle console"

Alors le produit n'est pas créé
Et j'ai un message "erreur, le titre ne doit pas contenir d'espace"

**User story :**

Mettre à jour un produit

**Règles métier :**

- le titre doit contenir entre 3 et 20 caractères
- le prix doit être strictement supérieur à 0 et strictement inférieur à 10000

**Scénarios :**

- Mise à jour réussie :

Étant donné un produit existant avec l'id 1
Quand je mets à jour le produit 1 avec :

- titre : "switch pro"
- prix : 350
- description : "console révisée"

Alors le produit est mis à jour
Et j'ai un message "produit mis à jour"

- Mise à jour échouée : produit inexistant

Étant donné qu'aucun produit n'existe avec l'id 999
Quand je mets à jour le produit 999 avec :

- titre : "switch pro"
- prix : 350
- description : "console révisée"

Alors le produit n'est pas mis à jour
Et j'ai un message "produit introuvable"

- Mise à jour échouée : prix hors limites

Étant donné un produit existant avec l'id 1
Quand je mets à jour le produit 1 avec :

- titre : "switch pro"
- prix : 15000
- description : "console révisée"

Alors le produit n'est pas mis à jour
Et j'ai un message "le prix doit être inférieur à 10000"

---

**User story :**

Supprimer un produit

**Règles métier :**

- seul un produit existant peut être supprimé

**Scénarios :**

- Suppression réussie :

Étant donné un produit existant avec l'id 1
Quand je supprime le produit 1
Alors le produit n'existe plus en base
Et j'ai un message "produit supprimé"

- Suppression échouée : produit inexistant

Étant donné qu'aucun produit n'existe avec l'id 999
Quand je supprime le produit 999
Alors j'ai un message "produit introuvable"

---

**User story :**

Créer une commande

**Règles métier :**

- une commande doit contenir entre 1 et 5 produits
- le prix total doit être compris entre 2 et 500
- une commande nouvellement créée a le statut PENDING

**Scénarios :**

- Création réussie :

Quand je créé une commande avec :

- productIds : [1, 2, 3]
- totalPrice : 150

Alors la commande est créée avec le statut PENDING
Et j'ai un message "commande créée"

- Création échouée : trop de produits

Quand je créé une commande avec :

- productIds : [1, 2, 3, 4, 5, 6]
- totalPrice : 150

Alors la commande n'est pas créée
Et j'ai un message "une commande doit contenir entre 1 et 5 produits"

- Création échouée : prix total hors limites

Quand je créé une commande avec :

- productIds : [1]
- totalPrice : 1

Alors la commande n'est pas créée
Et j'ai un message "le prix total doit être compris entre 2 et 500"

---

**User story :**

Annuler une commande

**Règles métier :**

- seule une commande au statut PENDING ou CONFIRMED peut être annulée
- une commande déjà SHIPPED ou DELIVERED ne peut plus être annulée
- une commande annulée passe au statut CANCELLED

**Scénarios :**

- Annulation réussie :

Étant donné une commande existante avec l'id 1 et le statut PENDING
Quand j'annule la commande 1
Alors la commande 1 a le statut CANCELLED
Et j'ai un message "commande annulée"

- Annulation échouée : commande déjà expédiée

Étant donné une commande existante avec l'id 1 et le statut SHIPPED
Quand j'annule la commande 1
Alors la commande 1 conserve le statut SHIPPED
Et j'ai un message "une commande expédiée ne peut plus être annulée"

- Annulation échouée : commande inexistante

Étant donné qu'aucune commande n'existe avec l'id 999
Quand j'annule la commande 999
Alors j'ai un message "commande introuvable"

---

**User story :**

Confirmer une commande

**Règles métier :**

- seule une commande au statut PENDING peut être confirmée
- une commande confirmée passe au statut CONFIRMED

**Scénarios :**

- Confirmation réussie :

Étant donné une commande existante avec l'id 1 et le statut PENDING
Quand je confirme la commande 1
Alors la commande 1 a le statut CONFIRMED
Et j'ai un message "commande confirmée"

- Confirmation échouée : commande déjà confirmée

Étant donné une commande existante avec l'id 1 et le statut CONFIRMED
Quand je confirme la commande 1
Alors j'ai un message "seule une commande au statut PENDING peut être confirmée"
