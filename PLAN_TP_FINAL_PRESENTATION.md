# TP final CI/CD - plan de finalisation rapide

## 1) Ou tu en es maintenant (etat reel)

- Une CI existe deja dans [.github/workflows/ci.yml](.github/workflows/ci.yml).
- Cette CI se declenche sur la branche m1-epsi (pas sur main).
- Cette CI lance seulement les tests unitaires (job unit-tests).
- Il n'y a pas encore de workflow CD dedie au push de tag.

Conclusion: bonne base, mais pas encore conforme a 100% a la consigne finale.

## 2) Ecart entre ta consigne et ton etat actuel

Rappel consigne:
- CI au push sur main
- CD au push d'un tag (version semantique)
- checks minimum: compilation + lint + au moins 1 test

Ecart actuel:
- declenchement CI incorrect (m1-epsi au lieu de main)
- pas de check explicite de compilation dans la CI
- pas de workflow CD sur tag

## 3) Ce qu'il reste a faire (ordre prioritaire, mode "presentation dans 1h")

## Etape A - corriger la CI (priorite haute)

1. Modifier [.github/workflows/ci.yml](.github/workflows/ci.yml):
- trigger: push sur main
- conserver npm ci
- ajouter les verifications:
  - compilation TypeScript (ex: npx tsc --noEmit)
  - lint (npm run lint)
  - test minimum (npm run test:unit)

2. Utiliser une version Node stable LTS (20) dans la CI pour eviter les questions sur la compatibilite (actuellement 25).

## Etape B - ajouter la CD sur tag (priorite haute)

1. Creer un workflow CD dans .github/workflows/cd.yml:
- trigger sur push tags: v*.*.*
- refaire les checks minimum (compilation/lint/test) avant de deployer
- etape de deploiement (meme simple pour le TP), par exemple:
  - build image docker
  - push image (si registre)
  - ou "echo deploy" si TP demo

2. Expliquer a l'oral la logique:
- main = deployable en permanence (grace a CI)
- tag = decision explicite de livrer une version (grace a CD)

## Etape C - scripts npm (si necessaire)

Dans [package.json](package.json), verifier/ajouter:
- script build (ex: tsc --noEmit)
- lint deja present
- test:unit deja present

Astuce: eviter les scripts watch en CI.

## Etape D - verification finale avant demo

Lancer localement:
- npm run lint
- npx tsc --noEmit
- npm run test:unit

Puis:
- push sur main => verifier CI verte
- creer un tag (ex: v1.0.0) et push tag => verifier CD

Commandes utiles:
- git checkout main
- git push origin main
- git tag v1.0.0
- git push origin v1.0.0

## 4) Script oral de 60 secondes (pret a dire)

"J'ai mis en place une CI qui valide la qualite sur le trunk main: installation, compilation TypeScript, lint et tests unitaires. Tant que la CI est verte, main reste deployable. Ensuite, j'ai ajoute une CD declenchee uniquement sur push de tag semantique vX.Y.Z. Le tag represente la decision de release, et le pipeline de CD rejoue les checks de securite avant le deploiement."

## 5) Questions probables du prof + reponses prêtes

Q1. Pourquoi separer CI et CD ?
R: La CI securise le code en continu sur main. La CD gere l'acte de livraison via un tag/version. On separe validation continue et decision de release.

Q2. Pourquoi declencher la CI sur main ?
R: Parce que la consigne demande de garder main deployable. Chaque push sur main doit etre verifie automatiquement.

Q3. Pourquoi declencher la CD sur tag et pas sur chaque push main ?
R: Le tag est un point de version explicite (release). On evite de deployer chaque commit de main en production sans decision metier.

Q4. Que signifie v1.2.3 ?
R: SemVer: 1 = majeure (breaking change), 2 = mineure (nouvelle feature compatible), 3 = patch (correctif).

Q5. Pourquoi inclure la compilation dans la CI ?
R: Pour detecter tot les erreurs TypeScript/JS avant merge/deploiement.

Q6. Pourquoi inclure le lint ?
R: Pour garantir des conventions de code et limiter le code fragile/illisible.

Q7. Pourquoi au moins un test en CI ?
R: Pour detecter les regressions fonctionnelles automatiquement.

Q8. Que se passe-t-il si un job echoue ?
R: Le pipeline est rouge, le commit est considere non deployable, il faut corriger avant release.

Q9. Pourquoi rejouer les checks dans la CD ?
R: Defense en profondeur: on revalide le code exact de la release taggee avant de deployer.

Q10. Pourquoi utiliser Node 20 en CI ?
R: C'est une LTS stable et largement supportee, donc moins de risque qu'une version tres recente.

Q11. Comment prouves-tu que ca marche pendant la demo ?
R: 1) push main -> CI verte. 2) git tag v1.0.0 + push tag -> CD lancee. 3) montrer les logs des jobs.

Q12. Quelle est la difference entre trunk deployable et deploiement automatique ?
R: Trunk deployable = techniquement pret a deployer. Deploiement automatique = action de livraison executee par la CD.

Q13. Si la CI est verte, est-ce que le code est forcement sans bug ?
R: Non, mais le risque est fortement reduit. La CI donne un filet de securite, pas une garantie absolue.

Q14. Pourquoi versionner aussi les correctifs ?
R: Pour tracer precisement quelle version corrige quel probleme et pouvoir rollback proprement.

Q15. Quel est le minimum vital pour respecter la consigne ?
R: CI sur main + check compilation + lint + 1 test, et CD sur push de tag semantique.

## 6) Pieges a eviter pendant la presentation

- Ne pas dire "j'ai une CI complete" si elle ne tourne pas sur main.
- Ne pas oublier de montrer le declenchement par tag pour la CD.
- Ne pas utiliser un script test en mode watch en pipeline.
- Ne pas confondre "main stable" et "prod automatiquement deployee".

## 7) Plan express (si tu as 20-30 min)

1. Corriger ci.yml (trigger main + compile/lint/test)
2. Creer cd.yml (trigger tags v*.*.* + checks + deploy step)
3. Faire un push main
4. Tagger v1.0.0 et push tag
5. Capturer les ecrans/logs de succes pour la soutenance
