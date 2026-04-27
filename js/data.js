/* Catalogue des modules BTS SIO + cartes d'exemple */

const MODULES = [
  { id:'M319', label:'C++',                  ck:'dk', topics:['Pointeurs','Classes','Templates','STL','Héritage'],        cards:64 },
  { id:'M106', label:'Maintenance BDD — Oracle', ck:'pr', topics:['Oracle/Docker','MCD→MLD→MPD','DDL & contraintes','DCL & rôles'], cards:0 },
  { id:'M231', label:'Protection données',   ck:'sf', topics:['RGPD','Chiffrement','DPO','Anonymisation'],                cards:32 },
  { id:'M162', label:'Modélisation',         ck:'sc', topics:['UML','MCD','MLD','Merise','E/R'],                          cards:56 },
  { id:'SI',   label:'Sciences appliquées',  ck:'sf', topics:['Électricité','Mécanique','Thermodynamique'],               cards:28 },
  { id:'M117', label:'Infrastructure réseau',ck:'dk', topics:['TCP/IP','VLAN','Routage','DNS','DHCP'],                    cards:72 },
  { id:'EGC',  label:'Culture générale',     ck:'pr', topics:['Actualités','Citoyenneté','Histoire'],                    cards:24 },
  { id:'FR',   label:'Français',             ck:'sf', topics:['Synthèse','Note','Argumentation'],                        cards:18 },
  { id:'AN',   label:'Anglais',              ck:'sf', topics:['Listening','Reading','Writing'],                          cards:30 },
  { id:'SC',   label:'Sciences',             ck:'sc', topics:['Physique','Chimie','Biologie'],                           cards:22 },
  { id:'MA',   label:'Maths',                ck:'dk', topics:['Algèbre','Probabilités','Analyse','Stats'],               cards:44 },
];

const CARDS = [
  { q:"Qu'est-ce qu'un pointeur en C++ ?",           a:"Variable stockant l'adresse mémoire d'une autre variable. Déclaré avec `*`, déréférencé avec `*ptr`, adresse avec `&var`.",                                 mod:'M319' },
  { q:"Différence entre DELETE et TRUNCATE en SQL ?", a:"DELETE supprime ligne par ligne (loggé, rollback possible). TRUNCATE vide la table instantanément — plus rapide mais non transactionnel.",                  mod:'M106' },
  { q:"Qu'est-ce que le RGPD ?",                     a:"Règlement Général sur la Protection des Données (2018). Encadre la collecte et le traitement des données personnelles des citoyens UE. Amende max : 4% CA.", mod:'M231' },
  { q:"Classe abstraite en UML — définition ?",       a:"Classe non instanciable directement. Sert de modèle pour les sous-classes. Notée en italique ou avec {abstract} en UML.",                                  mod:'M162' },
  { q:"Qu'est-ce qu'un VLAN ?",                       a:"Virtual LAN — segmentation logique d'un réseau physique. Isole le trafic, améliore la sécurité et les performances sans câblage supplémentaire.",          mod:'M117' },
];
