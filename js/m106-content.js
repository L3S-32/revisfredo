/* Contenu pédagogique du module M106 — Maintenance BDD Oracle.
   Utilisé par les écrans "Préparation Exam" et "Résumé".

   Le champ `summary` est un mini-format markdown :
     • paragraphes séparés par lignes vides
     • titres : "## Heading"
     • gras   : **texte**
     • code   : `texte`
     • listes : lignes commençant par "• " ou "- "
     • table  : lignes commençant par "|" (1ère ligne = en-tête) */

const M106_CONTENT = {
  themes: [
    /* ───────── Thème 1 ───────── */
    {
      id: 't1',
      num: 1,
      emoji: '🐳',
      title: 'Environnement Oracle',
      subtitle: 'Docker, SQL Developer, schémas',
      summary: `## Résumé

Oracle ne s'installe pas directement comme MySQL : il tourne dans un **conteneur Docker** (Oracle XE), géré via **Docker Desktop** (qui dépend de WSL sur Windows). Il faut démarrer Docker avant toute commande, et basculer MySQL→Oracle en début de journée.

On interagit avec la base via **SQL Developer**, dans lequel on crée deux connexions distinctes avec l'utilisateur \`system\` / mot de passe \`manager\` :

| Connexion | Type | Valeur |
| CDB | SID | \`XE\` |
| PDB | Service Name | \`XEPDB1\` |

## Différence Oracle vs MySQL

En MySQL, \`CREATE DATABASE ≈ CREATE SCHEMA\`. En Oracle, une seule instance physique contient plusieurs schémas, et un **schéma = un utilisateur** (relation 1:1). Créer un utilisateur \`magasin\` crée automatiquement le schéma \`magasin\`. Pour pointer vers un objet d'un autre schéma : \`magasin.client\`.

## Outils annexes

• \`winget\` pour installer SQL Developer
• \`PURGE RECYCLE BIN\` pour vider la corbeille Oracle (objets nommés \`BIN…\`)
• Script de suppression global à exécuter depuis \`SYSTEM\` pour repartir propre`,
      questions: [
        { type:'cours', q:"Pourquoi Oracle tourne-t-il dans un conteneur Docker plutôt qu'installé directement sur la machine ?" },
        { type:'cours', q:"De quoi Docker Desktop dépend-il sur Windows ? Que faire en cas d'erreur persistante ?" },
        { type:'cours', q:"Quel est le workflow à exécuter chaque matin pour commencer à travailler sur Oracle ?" },
        { type:'cours', q:"Combien de connexions faut-il créer dans SQL Developer pour travailler sur Oracle XE et pourquoi ?" },
        { type:'cours', q:"Quelle est la différence entre CDB et PDB dans Oracle ?" },
        { type:'cours', q:"Quels sont les identifiants par défaut pour se connecter en tant qu'administrateur Oracle XE ?" },
        { type:'cours', q:"Pour la connexion CDB, que faut-il cocher et saisir ? Et pour la PDB ?" },
        { type:'cours', q:"Que signifie l'acronyme SID et que vaut-il pour Oracle XE ?" },
        { type:'cours', q:"Quelle est la différence fondamentale entre la notion de base de données en MySQL et en Oracle ?" },
        { type:'cours', q:"En Oracle, quel est le lien entre un utilisateur et un schéma ?" },
        { type:'cours', q:"Comment pointer vers une table appartenant à un autre schéma ? Donne un exemple." },
        { type:'cours', q:"À quoi sert la commande PURGE RECYCLE BIN en Oracle ?" },
        { type:'cours', q:"Comment reconnaître un objet qui se trouve dans la corbeille d'Oracle ?" },
        { type:'cours', q:"Qu'est-ce que winget et à quoi sert-il dans le contexte du cours ?" },
        { type:'cours', q:"Pourquoi préfère-t-on le RJ45 au Wi-Fi ou hotspot à l'école ?" },
        { type:'qcm', q:"En Oracle, créer un utilisateur revient à :",
          options:["Créer une nouvelle base de données","Créer un schéma du même nom","Créer une table système","Créer un conteneur Docker"], correct:1 },
        { type:'qcm', q:"Le service name utilisé pour la connexion PDB Oracle XE est :",
          options:["XE","ORCL","XEPDB1","SYSTEM"], correct:2 },
        { type:'qcm', q:"Avant toute commande SQL Developer, il faut :",
          options:["Redémarrer Windows","Démarrer Docker et lancer le conteneur Oracle","Vider la corbeille Oracle","Mettre à jour WSL"], correct:1 },
        { type:'qcm', q:"En MySQL, CREATE DATABASE et CREATE SCHEMA :",
          options:["Font deux choses différentes","Font la même chose","N'existent pas","Nécessitent d'être administrateur"], correct:1 },
        { type:'exo', q:"Décris pas à pas comment créer une connexion SQL Developer pour la PDB d'Oracle XE, en listant tous les champs à remplir." },
        { type:'exo', q:"Un camarade dit « Docker ne démarre pas, j'ai une erreur ». Liste les 3 vérifications à faire dans l'ordre." },
      ],
    },

    /* ───────── Thème 2 ───────── */
    {
      id: 't2',
      num: 2,
      emoji: '🧩',
      title: 'Cas magasin — Entités et relations',
      subtitle: 'MCD → MLD → MPD',
      summary: `## Résumé

Concevoir une base de données suit trois étapes dans l'ordre :

| Modèle | Question | Public | Contenu |
| **MCD** | Quoi ? | Client, métier | Entités, associations, cardinalités. Indépendant du SGBDR. |
| **MLD** | Comment ? | Développeur | Tables, PK/FK, tables associatives, types génériques. |
| **MPD** | Avec quoi ? | DBA / code | Script SQL \`CREATE TABLE\` pour un SGBDR précis. |

## Cas magasin — entités identifiées

• **Client** : id, nom, prénom, rue/n°, téléphone, e-mail, date de naissance, titre (Monsieur / Madame)
• **Produit** : nom, prix, description, IAN
• **Commande** : id, date, état
• **Catégorie** : entité séparée (pas un simple attribut de Produit, car réutilisée)
• **Localité / NPA** : entité séparée pour factoriser ville + NPA (évite les redondances)
• **Commande_Produit** : table associative (relation N:N) qui stocke quantité et prix au moment de l'achat → permet d'historiser le prix même si le produit change de tarif plus tard

## Cardinalités clés

• Client \`(0..*)\` ↔ \`(1,1)\` Commande — pas de commande orpheline
• Commande \`(1..*)\` ↔ \`(0..*)\` Produit — une commande a au moins 1 produit
• Produit \`(1,1)\` → \`(0..* ou 1..*)\` Catégorie

## Règle d'or MLD → MPD

On crée d'abord les tables sans FK (Localité, Catégorie), puis les tables qui référencent (Client, Produit), et enfin les tables associatives (Commande_Produit).`,
      questions: [
        { type:'cours', q:"Que signifient les acronymes MCD, MLD, MPD ?" },
        { type:'cours', q:"Dans quel ordre produit-on ces trois modèles et pourquoi cet ordre ?" },
        { type:'cours', q:"Quelle question chacun des trois modèles répond-il ?" },
        { type:'cours', q:"Lequel de ces trois modèles dépend du SGBDR choisi (Oracle, MySQL…) ?" },
        { type:'cours', q:"À qui s'adresse le MCD ? À qui s'adresse le MLD ?" },
        { type:'cours', q:"Que représente une cardinalité dans un MCD ? Donne les 3 cardinalités classiques." },
        { type:'cours', q:"Qu'est-ce qu'une table associative et quand est-elle créée ?" },
        { type:'cours', q:"Dans la relation Commande–Produit, pourquoi créer une table associative ?" },
        { type:'cours', q:"Quels attributs doit-on placer dans la table associative Commande_Produit et pourquoi ?" },
        { type:'cours', q:"Pourquoi faut-il historiser le prix dans la table associative et non le reprendre depuis la table Produit ?" },
        { type:'cours', q:"Pourquoi la catégorie est-elle une entité séparée et pas un simple attribut de Produit ?" },
        { type:'cours', q:"Pourquoi factoriser la ville et le NPA dans une entité Localité séparée ?" },
        { type:'cours', q:"Selon quelle règle place-t-on une clé étrangère dans une relation 1,N ?" },
        { type:'cours', q:"Que se passe-t-il pour une relation N,N au passage du MCD au MLD ?" },
        { type:'cours', q:"Dans quel ordre faut-il créer les tables dans le MPD, et pourquoi ?" },
        { type:'cours', q:"Cite deux logiciels permettant de faire de la modélisation graphique." },
        { type:'qcm', q:"Le MCD est destiné à :",
          options:["L'administrateur système","Le client et les parties prenantes métier","Le développeur uniquement","Oracle directement"], correct:1 },
        { type:'qcm', q:"Une relation N:N entre deux entités devient au MLD :",
          options:["Une clé étrangère dans une des deux tables","Une table associative","Deux clés primaires","Une vue"], correct:1 },
        { type:'qcm', q:"Dans la relation Client–Commande du magasin, les cardinalités sont :",
          options:["Client (1,1) — (1,1) Commande","Client (0..*) — (1,1) Commande","Client (1..*) — (0..*) Commande","Client (0..*) — (0..*) Commande"], correct:1 },
        { type:'qcm', q:"Dans une relation 1,N, la clé étrangère se place :",
          options:["Dans la table du côté « 1 »","Dans la table du côté « N » (plusieurs)","Dans les deux tables","Dans une table associative"], correct:1 },
        { type:'qcm', q:"L'ordre de création des tables est :",
          options:["Tables associatives → tables dépendantes → tables référencées","Peu importe l'ordre","Tables référencées (sans FK) → tables dépendantes → tables associatives","Par ordre alphabétique"], correct:2 },
        { type:'exo', q:"Dessine le MCD d'une bibliothèque avec les entités Livre, Auteur, Emprunt, Adhérent. Indique les cardinalités et justifie chacune par une phrase métier." },
        { type:'exo', q:"On te donne ce MCD : Client (0..*) passe (1,1) Commande ; Commande (1..*) contient (0..*) Produit. Écris le MLD correspondant en listant toutes les tables avec leurs PK, FK et attributs." },
        { type:'exo', q:"Dans quel ordre créerais-tu les tables Client, Localité, Commande, Commande_Produit, Produit, Catégorie ? Justifie." },
      ],
    },

    /* ───────── Thème 3 ───────── */
    {
      id: 't3',
      num: 3,
      emoji: '🏗️',
      title: 'DDL et contraintes Oracle',
      subtitle: 'Implémentation physique',
      summary: `## Résumé

Le **LDD** (Langage de Définition de Données, DDL en anglais) = tout ce qui crée ou modifie la structure : \`CREATE TABLE\`, \`ALTER TABLE\`, \`DROP\`.

## Types Oracle à retenir

• \`VARCHAR2(n)\` pour les chaînes (allocation dynamique, préféré à \`VARCHAR\`)
• \`NUMBER\` pour les entiers et décimaux
• **Règle codes** : un numéro/code sans calcul (NPA, IAN, téléphone) → \`VARCHAR2\`, jamais \`NUMBER\` (pour garder les zéros à gauche et les préfixes)

## Clés primaires auto-générées

• MySQL : \`AUTO_INCREMENT\`
• Oracle ancien : séquence + trigger \`BEFORE INSERT\` (lourd)
• Oracle moderne (12c+) : \`GENERATED BY DEFAULT AS IDENTITY\` ← méthode recommandée, permet d'insérer avec ou sans valeur de PK

## Les 5 contraintes à maîtriser

| Contrainte | Rôle | Préfixe |
| \`PRIMARY KEY\` | Identifiant unique + non nul | \`CTPK_\` ou \`PK_\` |
| \`FOREIGN KEY\` | Intégrité référentielle | \`CTFK_\` ou \`FK_\` |
| \`UNIQUE\` | Valeur unique (mais peut être nulle) | \`CTUK_\` ou \`UK_\` |
| \`NOT NULL\` | Valeur obligatoire | \`CTNN_\` ou \`NN_\` |
| \`CHECK\` | Règle métier (ex : âge > 0) | \`CTCK_\` ou \`CK_\` |

## Règle absolue

Toujours **NOMMER** ses contraintes avec \`CONSTRAINT nom_explicite ...\`. Ça permet d'avoir des messages d'erreur compréhensibles au lieu d'un \`ORA-00001: SYS_C007234\` illisible.

## Propriétés d'une PK

Unique, non nulle, **non porteuse d'information** : ne JAMAIS mettre un numéro AVS, un email ou un code produit en PK → préférer un ID technique auto-généré.

## Documentation dans la base

\`COMMENT ON TABLE client IS 'Table des clients du magasin';\` et \`COMMENT ON COLUMN client.titre IS 'Monsieur ou Madame';\`. Évite la désync avec des docs externes.

Exemple pour l'exercice 1.3 : \`CHECK (titre IN ('Monsieur','Madame'))\` et \`CHECK (etat_commande IN (1, 9))\`.`,
      questions: [
        { type:'cours', q:"Quels sont les 4 sous-langages du SQL ? Donne leur nom complet et un exemple de commande pour chacun." },
        { type:'cours', q:"Quel sous-langage contient CREATE TABLE ?" },
        { type:'cours', q:"Quelles sont les trois propriétés d'une bonne clé primaire ?" },
        { type:'cours', q:"Que signifie « une PK ne doit pas être porteuse d'information » ? Donne un contre-exemple." },
        { type:'cours', q:"Quel type utiliser en Oracle pour une chaîne de caractères ? Pourquoi pas VARCHAR ?" },
        { type:'cours', q:"Quel type utiliser pour un numéro de téléphone ou un NPA ? Pourquoi pas NUMBER ?" },
        { type:'cours', q:"Quelle est la différence entre MySQL et Oracle pour l'auto-incrémentation des PK ?" },
        { type:'cours', q:"Comment Oracle ancien gérait-il l'auto-incrémentation avant la version 12c ?" },
        { type:'cours', q:"Écris la syntaxe moderne Oracle pour une PK auto-incrémentée." },
        { type:'cours', q:"Quels sont les 3 modes de GENERATED … AS IDENTITY et lequel est recommandé ?" },
        { type:'cours', q:"Cite les 5 grandes contraintes d'intégrité et leur rôle." },
        { type:'cours', q:"Quelle est la différence entre UNIQUE et PRIMARY KEY ?" },
        { type:'cours', q:"À quoi sert la contrainte CHECK ? Donne deux exemples concrets." },
        { type:'cours', q:"Pourquoi faut-il nommer ses contraintes ? Illustre avec un exemple de message d'erreur." },
        { type:'cours', q:"Quels préfixes de nommage ont été vus en cours pour les contraintes ?" },
        { type:'cours', q:"Que garantit une clé étrangère concernant l'intégrité référentielle ?" },
        { type:'cours', q:"Que se passe-t-il si on tente d'insérer une FK qui pointe vers un id inexistant ?" },
        { type:'cours', q:"Que se passe-t-il si on tente de supprimer une ligne dont la PK est référencée ailleurs ?" },
        { type:'cours', q:"À quoi servent COMMENT ON TABLE et COMMENT ON COLUMN ? Pourquoi est-ce important ?" },
        { type:'cours', q:"Cite les deux CHECK obligatoires demandés dans l'exercice 1.3 du schéma magasin." },
        { type:'qcm', q:"Pour stocker un numéro postal suisse (ex : 2800), on utilise :",
          options:["NUMBER(4)","INT","VARCHAR2(4)","CHAR(4)"], correct:2 },
        { type:'qcm', q:"La méthode moderne en Oracle pour auto-générer une PK est :",
          options:["AUTO_INCREMENT","SEQUENCE + TRIGGER","GENERATED BY DEFAULT AS IDENTITY","SERIAL"], correct:2 },
        { type:'qcm', q:"Laquelle de ces contraintes peut accepter des valeurs NULL ?",
          options:["PRIMARY KEY","NOT NULL","UNIQUE","Aucune des trois"], correct:2 },
        { type:'qcm', q:"Le sous-langage SQL qui contient CREATE TABLE est :",
          options:["LMD (DML)","LCD (DCL)","LDD (DDL)","LCT (TCL)"], correct:2 },
        { type:'qcm', q:"Nommer les contraintes permet principalement :",
          options:["D'améliorer les performances","D'obtenir des messages d'erreur lisibles","De gagner de la place en base","De chiffrer les données"], correct:1 },
        { type:'exo', q:"Écris le CREATE TABLE pour une table client avec : id auto-généré, nom, prénom, email unique, titre (Monsieur ou Madame uniquement), date de naissance. Nomme toutes tes contraintes." },
        { type:'exo', q:"Écris le CREATE TABLE pour la table commande avec une FK vers client et un CHECK sur l'état (1 ou 9 uniquement). Ajoute aussi les commentaires sur la table et sur la colonne « etat »." },
        { type:'exo', q:"Corrige ce code et explique les erreurs :\nCREATE TABLE produit (\n  id NUMBER PRIMARY KEY,\n  nom VARCHAR(50),\n  prix NUMBER NOT NULL,\n  code_barre NUMBER\n);" },
      ],
    },

    /* ───────── Thème 4 ───────── */
    {
      id: 't4',
      num: 4,
      emoji: '🔐',
      title: 'Gestion des droits — DCL et rôles',
      subtitle: 'GRANT / REVOKE',
      summary: `## Résumé

Le **LCD** (Langage de Contrôle des Données, DCL) gère qui a le droit de faire quoi. Deux commandes principales :

• \`GRANT\` : attribuer un droit
• \`REVOKE\` : retirer un droit

## Deux types de privilèges

| Type | Exemples | Portée |
| **Système** | \`CREATE SESSION\`, \`CREATE TABLE\`, \`CREATE VIEW\` | Actions globales sur la base |
| **Objet** | \`SELECT\`, \`INSERT\`, \`UPDATE\`, \`DELETE\` sur \`magasin.client\` | Sur un objet précis |

## Workflow recommandé : les rôles

\`\`\`sql
-- 1. Créer le rôle
CREATE ROLE commercial;

-- 2. Attribuer les privilèges au rôle
GRANT SELECT, INSERT ON magasin.client TO commercial;
GRANT SELECT ON magasin.produit TO commercial;

-- 3. Créer l'utilisateur avec son droit de connexion
CREATE USER Paul IDENTIFIED BY motDePasse;
GRANT CREATE SESSION TO Paul;

-- 4. Assigner le rôle à l'utilisateur
GRANT commercial TO Paul;
\`\`\`

**Pourquoi les rôles ?** Si tu as 50 commerciaux et tu dois modifier leurs droits, tu modifies un seul rôle au lieu de 50 utilisateurs.

## ⚠️ À éviter

Les rôles prédéfinis d'Oracle (\`CONNECT\`, \`RESOURCE\`) :

• Ils donnent trop de droits (violation du principe du moindre privilège)
• Leur contenu change entre les versions d'Oracle → comportement imprévisible

## Délégation de droits

• \`WITH GRANT OPTION\` (privilèges d'objet) : « tu peux redonner ce droit à d'autres ». Si on te le retire, ça s'applique en **cascade** à ceux à qui tu l'as donné.
• \`WITH ADMIN OPTION\` (privilèges système) : même idée, mais **PAS de cascade** à la révocation.`,
      questions: [
        { type:'cours', q:"Que signifie l'acronyme DCL (LCD) ? Quelle est sa fonction ?" },
        { type:'cours', q:"Cite les deux commandes principales du DCL." },
        { type:'cours', q:"Quelle est la différence entre un privilège système et un privilège d'objet ? Donne deux exemples de chaque." },
        { type:'cours', q:"Pourquoi CREATE SESSION est-il le premier droit à accorder à tout nouvel utilisateur ?" },
        { type:'cours', q:"Qu'est-ce qu'un rôle en Oracle ?" },
        { type:'cours', q:"Quelles sont les 4 étapes du workflow de gestion des droits par rôles ?" },
        { type:'cours', q:"Pourquoi passer par des rôles plutôt que donner des droits individuels ?" },
        { type:'cours', q:"Cite deux rôles prédéfinis d'Oracle." },
        { type:'cours', q:"Pour quelles deux raisons faut-il éviter les rôles prédéfinis d'Oracle ?" },
        { type:'cours', q:"Qu'est-ce que le principe du moindre privilège ?" },
        { type:'cours', q:"Quelle clause permet à un utilisateur de déléguer un privilège d'objet ?" },
        { type:'cours', q:"Quelle clause permet à un utilisateur de déléguer un privilège système ?" },
        { type:'cours', q:"Quelle est la différence fondamentale entre WITH GRANT OPTION et WITH ADMIN OPTION lors d'une révocation ?" },
        { type:'cours', q:"Explique avec un scénario concret l'effet cascade de la révocation." },
        { type:'cours', q:"Dans quel ordre logique faut-il : créer l'utilisateur, créer le rôle, attribuer des privilèges, attribuer le rôle ?" },
        { type:'qcm', q:"GRANT et REVOKE appartiennent à :",
          options:["LDD (DDL)","LMD (DML)","LCD (DCL)","LCT (TCL)"], correct:2 },
        { type:'qcm', q:"CREATE SESSION est un privilège :",
          options:["D'objet","Système","De rôle","Inexistant"], correct:1 },
        { type:'qcm', q:"SELECT sur la table magasin.client est un privilège :",
          options:["D'objet","Système","De rôle","Obligatoire"], correct:0 },
        { type:'qcm', q:"Les rôles prédéfinis d'Oracle (CONNECT, RESOURCE) sont déconseillés car :",
          options:["Ils sont payants","Ils donnent trop de droits et changent entre versions","Ils ne fonctionnent pas en XE","Ils sont lents"], correct:1 },
        { type:'qcm', q:"Lors d'une révocation, la cascade s'applique avec :",
          options:["WITH ADMIN OPTION uniquement","WITH GRANT OPTION uniquement","Les deux","Aucune des deux"], correct:1 },
        { type:'qcm', q:"Pour qu'un utilisateur puisse se connecter à Oracle, il faut obligatoirement lui donner :",
          options:["GRANT CONNECT","GRANT CREATE SESSION","GRANT SELECT","GRANT ALL"], correct:1 },
        { type:'exo', q:"Écris le script SQL complet pour : (1) créer un rôle responsable_stock ; (2) lui donner SELECT, INSERT, UPDATE sur magasin.produit ; (3) créer l'utilisateur Marie / mot de passe Marie2026 ; (4) lui permettre de se connecter ; (5) lui attribuer le rôle." },
        { type:'exo', q:"Paul a reçu GRANT SELECT ON client TO Paul WITH GRANT OPTION;. Paul donne ensuite ce droit à Marie. L'administrateur révoque le droit de Paul. Que se passe-t-il pour Marie ? Justifie." },
        { type:'exo', q:"Paul a reçu GRANT CREATE TABLE TO Paul WITH ADMIN OPTION;. Même scénario : Paul donne le droit à Marie, puis l'admin révoque Paul. Que se passe-t-il pour Marie ?" },
        { type:'exo', q:"Cas de synthèse : tu dois gérer les droits du schéma magasin pour 3 profils : magasin_admin (tout faire), responsable_stock (modifier les produits et les stocks), commercial (lire produits, créer des commandes). Décris les GRANT à effectuer pour chaque rôle." },
      ],
    },

    /* ───────── Thème transversal ───────── */
    {
      id: 'tx',
      num: 5,
      emoji: '🟨',
      title: 'Questions transversales',
      subtitle: 'Synthèse des 4 thèmes',
      summary: `## Résumé

Cette section regroupe des questions qui cumulent plusieurs thèmes (modélisation, DDL, DCL, environnement) ainsi qu'un cas pratique final de synthèse.

## Cas final — Système de location de vélos

On te demande de modéliser et implémenter un petit système de location de vélos avec : **clients**, **vélos**, **locations**, **stations**.

Une location a un client, un vélo, une station de départ, une station d'arrivée, une date/heure de début, une date/heure de fin, et un prix calculé.

## Étapes attendues

• Dessine le **MCD** avec cardinalités justifiées
• Traduis-le en **MLD** (liste toutes les tables avec PK et FK)
• Détermine l'ordre de création des tables
• Écris le \`CREATE TABLE\` complet de la table \`location\` avec toutes les contraintes nommées et au moins **deux CHECK**
• Crée un rôle \`employe_station\` qui peut lire tous les clients/vélos/stations et insérer/modifier des locations
• Crée l'utilisateur \`Lucas\` et attribue-lui ce rôle`,
      questions: [
        { type:'cours', q:"Décris le parcours complet d'un projet de base de données, depuis la réunion avec le client jusqu'à l'utilisateur final qui se connecte et fait une requête. Cite tous les concepts vus (MCD, MLD, MPD, DDL, DCL, rôles)." },
        { type:'cours', q:"Un développeur te dit : « J'ai créé mes tables, j'ai inséré des données, mais je n'arrive pas à me connecter avec mon nouvel utilisateur. » Quelle est probablement l'erreur ?" },
        { type:'cours', q:"Classe ces commandes dans le bon sous-langage SQL : CREATE TABLE, GRANT, INSERT, COMMIT, DROP, SELECT, REVOKE, UPDATE, ROLLBACK, ALTER." },
        { type:'cours', q:"Pour chacune des 4 familles SQL (LDD, LMD, LCD, LCT), donne son nom anglais (DDL, DML, DCL, TCL) et un exemple de commande." },
        { type:'cours', q:"À chaque étape de la conception (MCD → MLD → MPD), on retrouve des contraintes. Lesquelles apparaissent à quel niveau ?" },
        { type:'exo', q:"Cas final — étape 1 : dessine le MCD du système de location de vélos avec cardinalités justifiées." },
        { type:'exo', q:"Cas final — étape 2 : traduis le MCD en MLD (liste toutes les tables avec PK et FK)." },
        { type:'exo', q:"Cas final — étape 3 : dans quel ordre créer les tables ? Justifie." },
        { type:'exo', q:"Cas final — étape 4 : écris le CREATE TABLE complet de la table location avec toutes les contraintes nommées et au moins deux CHECK." },
        { type:'exo', q:"Cas final — étape 5 : crée un rôle employe_station qui peut lire tous les clients/vélos/stations et insérer/modifier des locations. Crée l'utilisateur Lucas et attribue-lui ce rôle." },
      ],
    },
  ],

  /* ───────── 10 pièges les plus probables à l'examen ───────── */
  pieges: [
    "Confondre SID et Service Name dans SQL Developer.",
    "Mettre un code (NPA, téléphone) en NUMBER au lieu de VARCHAR2.",
    "Oublier GRANT CREATE SESSION quand on crée un utilisateur.",
    "Utiliser les rôles prédéfinis CONNECT/RESOURCE.",
    "Oublier de nommer une contrainte (= messages d'erreur illisibles).",
    "Créer les tables dans le mauvais ordre (erreurs de FK).",
    "Confondre l'effet cascade : GRANT OPTION (cascade) vs ADMIN OPTION (pas cascade).",
    "Oublier d'historiser le prix dans la table associative Commande_Produit.",
    "Mettre la FK du mauvais côté dans une relation 1,N.",
    "Utiliser une info métier comme PK (numéro AVS, email…).",
  ],
};
