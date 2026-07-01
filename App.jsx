import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

var _stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

// ⚠️ MODE DEV — mettre à true pour court-circuiter l'authentification en développement
const DEV_BYPASS_AUTH = false;
const DEV_ACCOUNT_TYPE = "client"; // "client" | "hotel" | "restaurant"
import {
  Home, Search, MessageCircle, User, Bell, Settings, Star, Heart,
  Share2, Link2, MapPin, ArrowLeft, X, Plus, Trash2, Edit2, Eye, Calendar,
  CreditCard, Users, AlertTriangle, LogOut, Lock, Mail, Send,
  MoreVertical, CheckCircle, XCircle, ChevronRight, ChevronDown, FileText, Flag, Activity,
  Building2, Utensils, Shield, ShieldCheck, Phone, Package, Waves,
  EyeOff, Car, Dumbbell, Tag, Wifi, Bookmark, Clock, UserPlus, UserCheck, Camera
} from "lucide-react";

const DS = {
  bg:"#09090F", surface:"#111119", card:"#17171F", border:"#252533",
  text:"#EFEFFA", textMuted:"#7A7A96", textDim:"#45455E",
  primary:"#6366F1", primaryMed:"#6366F130", primarySoft:"#6366F112",
  hotel:"#F97316", hotelSoft:"#F9731618",
  restaurant:"#0EA875", restaurantSoft:"#0EA87518",
  client:"#2563EB", clientSoft:"#2563EB18",
  success:"#22C55E", successSoft:"#22C55E18",
  error:"#EF4444", errorSoft:"#EF444418",
  warning:"#F59E0B", warningSoft:"#F59E0B18",
  gold:"#F59E0B", goldSoft:"#F59E0B15",
  info:"#6366F1", infoSoft:"#6366F112",
};
function rC(t){return({hotel:DS.hotel,restaurant:DS.restaurant,client:DS.client})[t]||DS.primary;}
// Nettoie le texte utilisateur : supprime les balises HTML, limite la longueur
function sanitizeText(str, maxLen){
  if(!str) return "";
  var clean = String(str).replace(/<[^>]*>/g,"").replace(/javascript:/gi,"").trim();
  var limit = maxLen||1000;
  return clean.length > limit ? clean.slice(0, limit) : clean;
}
function fmtK(n){
  if(n===null||n===undefined)return"0";
  if(n>=1000000){var m=Math.round(n/100000)/10;return(m%1===0?m.toFixed(0):m)+"M";}
  if(n>=1000){var k=Math.round(n/100)/10;return(k%1===0?k.toFixed(0):k)+"k";}
  return String(n);
}

const ANIM_CSS="@keyframes hp-fade-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes hp-slide-right{from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:translateX(0)}}@keyframes hp-slide-out-right{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(40px)}}@keyframes hp-slide-up{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes hp-scale-in{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}@keyframes hp-fade{from{opacity:0}to{opacity:1}}@keyframes hp-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes hp-item-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes hp-shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}@keyframes hp-heart-pop{0%{transform:scale(1)}20%{transform:scale(1.45)}40%{transform:scale(1.1)}60%{transform:scale(1.28)}80%{transform:scale(.97)}100%{transform:scale(1)}}@keyframes hp-bounce-in{0%{opacity:0;transform:scale(.87) translateY(10px)}55%{opacity:1;transform:scale(1.03)}75%{transform:scale(.99)}100%{opacity:1;transform:scale(1)}}@keyframes hp-toast-in{from{opacity:0;transform:translateX(-50%) translateY(18px) scale(.93)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}@keyframes hp-slide-down{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}@keyframes hp-sheet-out{from{transform:translateY(0);opacity:1}to{transform:translateY(100%);opacity:0}}@keyframes hp-msg-in{from{opacity:0;transform:translateY(6px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes hp-success-ring{0%{transform:scale(.7);opacity:0}60%{transform:scale(1.12);opacity:1}80%{transform:scale(.96)}100%{transform:scale(1);opacity:1}}button{transition:opacity .16s cubic-bezier(0.22,1,0.36,1),transform .14s cubic-bezier(0.22,1,0.36,1),background .18s ease,color .18s ease}button:active{transform:scale(.94);opacity:.82}.hp-scroll{-webkit-overflow-scrolling:touch}.hp-card{transition:box-shadow .18s ease,transform .16s ease}.hp-card:active{transform:scale(.984)}.hp-img{opacity:0;transition:opacity .38s ease}.hp-img-loaded{opacity:1}.hp-input-focus{outline:none!important;box-shadow:0 0 0 2.5px #6366F133!important;border-color:#6366F1!important;transition:box-shadow .18s ease,border-color .18s ease}.hp-sk{background:linear-gradient(90deg,#17171F 25%,#252533 50%,#17171F 75%);background-size:600px 100%;animation:hp-shimmer 1.5s infinite linear;border-radius:8px}input,textarea{transition:box-shadow .18s ease,border-color .18s ease}";
function useAnimations(){useEffect(function(){if(document.getElementById("hp-a"))return;var s=document.createElement("style");s.id="hp-a";s.textContent=ANIM_CSS;document.head.appendChild(s);},[]);}

const HOTELS=[
  {id:"h1",name:"Grand Hotel Royal",type:"hotel",location:"Dakar, Sénégal",img:"https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=70",rating:4.9,reviewCount:1284,priceFrom:120,followers:2341,verified:false,isPremium:false,hasRestaurant:true,svcMode:"combined",description:"Hôtel 5 étoiles au cœur de Dakar. Vue mer exceptionnelle, spa luxueux.",services:[{id:"svc1",name:"Spa",active:true},{id:"svc2",name:"Restaurant Gastronomique",active:true},{id:"svc3",name:"Piscine Infinity",active:true},{id:"svc4",name:"Salle de conférence",active:true},{id:"svc5",name:"Navette aéroport",active:true},{id:"svc6",name:"Room Service 24h",active:true}],rooms:[{id:"r1",name:"Suite Présidentielle",price:450,capacity:2,available:true,stock:3},{id:"r2",name:"Chambre Supérieure",price:240,capacity:2,available:true,stock:6},{id:"r3",name:"Chambre Deluxe",price:180,capacity:2,available:false,stock:0}],menu:[{cat:"Entrées",items:[{name:"Salade César",price:14,description:"Poulet grillé, parmesan, croutons"},{name:"Soupe du jour",price:9,description:"Selon arrivage du marché"}]},{cat:"Plats",items:[{name:"Thiof grillé",price:28,description:"Poisson local, riz, légumes"},{name:"Filet de boeuf",price:34,description:"Sauce au poivre, frites maison"}]}],meals:[{id:"breakfast",name:"Petit-déjeuner",price:12},{id:"lunch",name:"Déjeuner",price:18},{id:"dinner",name:"Dîner",price:25}]},
  {id:"h2",name:"Savane Lodge",type:"hotel",location:"Nairobi, Kenya",img:"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=70",rating:4.6,reviewCount:643,priceFrom:89,followers:876,verified:true,isPremium:false,description:"Lodge authentique en pleine nature. Safari experience unique.",services:["Safari Guide","Restaurant","Piscine","Connexion WiFi"],rooms:[{id:"r3",name:"Bungalow Safari",price:89,capacity:2,available:true},{id:"r4",name:"Villa Familiale",price:180,capacity:4,available:true}]},
];
const RESTAURANTS=[
  {id:"res1",name:"Le Jardin Gourmand",type:"restaurant",location:"Abidjan, Côte d'Ivoire",img:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=70",rating:4.8,reviewCount:2341,priceFrom:15,followers:3210,verified:false,isPremium:false,description:"Cuisine africaine contemporaine. Produits locaux sélectionnés.",offers:["Menu Découverte 35€","Brunch Dominical 28€","Menu Business 22€"],menu:[{cat:"Entrées",items:[{name:"Thiéboudienne Royal",price:18},{name:"Yassa Poulet",price:16}]},{cat:"Plats",items:[{name:"Attieke Poisson",price:22},{name:"Kedjenou",price:20}]},{cat:"Desserts",items:[{name:"Thiakry",price:8},{name:"Banane Flambée",price:10}]}]},
  {id:"res2",name:"Chez Mamie Fatou",type:"restaurant",location:"Bamako, Mali",img:"https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=70",rating:4.7,reviewCount:1876,priceFrom:8,followers:1540,verified:false,isPremium:false,description:"Cuisine malienne authentique. Ambiance familiale.",offers:["Plat du Jour 8 EUR","Menu Complet 14 EUR"],menu:[{cat:"Plats",items:[{name:"Riz au Gras",price:8},{name:"To Sauce Arachide",price:10}]},{cat:"Boissons",items:[{name:"Bissap",price:2},{name:"Gingembre",price:2}]}]},
];
const CC=[
  {pN:"Grand Hotel Royal",pI:"https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=60&q=70",pV:true,messages:[{id:1,f:"them",t:"Bonjour, votre réservation est confirmée pour le 24 juillet.",time:"10:30",read:true},{id:2,f:"me",t:"Merci beaucoup !",time:"10:34",read:true},{id:3,f:"them",t:"Avez-vous des préférences alimentaires ?",time:"10:35",read:false}]},
  {pN:"Le Jardin Gourmand",pI:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=60&q=70",pV:true,messages:[{id:4,f:"them",t:"Merci pour votre avis ! Nous serons ravis de vous revoir.",time:"09:00",read:true}]},
];
const CP=[];
const FEED=[
  {id:"h1",author:"Grand Hotel Royal",type:"hotel",time:"2h",img:"https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=70",text:"Découvrez notre nouvelle suite présidentielle rénovée ! Vue mer panoramique.",likes:284,comments:12,shares:18,followers:2341,verified:true,combined:true},
  {id:"res1",author:"Le Jardin Gourmand",type:"restaurant",time:"4h",img:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=70",text:"Menu spécial ce soir : Homard grillé aux épices africaines. Réservation recommandée !",likes:512,comments:34,shares:47,followers:3210,verified:true},
  {id:"h2",author:"Savane Lodge",type:"hotel",time:"6h",img:"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=70",text:"Safari au lever du soleil - des moments inoubliables.",likes:156,comments:8,shares:9,followers:876,verified:true},
  {id:"res2",author:"Chez Mamie Fatou",type:"restaurant",time:"8h",img:"https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=70",text:"Aujourd'hui : Thiéboudienne spéciale avec poissons du jour.",likes:89,comments:5,shares:4,followers:1540,verified:false},
];
// Publicités bandeau — sponsorisées par les établissements (configurables par l'Admin)
const ADS_POOL=[
  {active:true,label:"SPONSORISÉ",estab:"Grand Hotel Royal",text:"Suite Prestige disponible dès 89€/nuit · Dakar, Sénégal"},
  {active:true,label:"SPONSORISÉ",estab:"Le Jardin Gourmand",text:"Menu découverte africain -15% ce weekend · Abidjan"},
  {active:true,label:"SPONSORISÉ",estab:"Savane Lodge",text:"Safari au lever du soleil · Expérience unique · Nairobi"},
  {active:true,label:"SPONSORISÉ",estab:"Chez Mamie Fatou",text:"Thiéboudienne du jour · Cuisine malienne authentique · Bamako"},
];
// Publicité bannière — affichée une seule fois à l'ouverture de l'app
const SPLASH_AD={
  estab:"Grand Hotel Royal",
  img:"https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80",
  label:"Établissement Partenaire",
  text:"Vivez une expérience inoubliable au Grand Hotel Royal. Suite Prestige dès 89€/nuit.",
  cta:"Découvrir",
};

// =====================================================================
// COUCHE DE DONNEES CENTRALISEE (DataLayer)
// ---------------------------------------------------------------------
// Point d'acces unique a toutes les donnees de l'application.
// Aujourd'hui : retourne les donnees de demonstration ci-dessus.
// Demain : il suffira de remplacer l'interieur de chaque fonction par un
// appel reseau (Supabase / API REST) SANS toucher au reste de l'app.
// Exemple futur :
//   getHotels: async function(){ const r = await fetch(API+"/hotels"); return r.json(); }
// =====================================================================
var DataLayer = {
  // Cache interne : initialise avec les donnees de demonstration.
  // L'UI lit TOUJOURS depuis ce cache (synchrone, jamais vide).
  // Supabase, quand disponible, vient REMPLACER le contenu du cache en arriere-plan.
  _cache: {
    hotels: HOTELS,
    restaurants: RESTAURANTS,
    feed: FEED,
    clientChats: CC,
    proChats: CP,
    ad: ADS_POOL[0]
  },
  _onUpdate: null, // callback optionnel pour rafraichir l'UI apres sync

  // --- Etablissements ---
  getHotels: function(){ return DataLayer._cache.hotels; },
  getRestaurants: function(){ return DataLayer._cache.restaurants; },
  getEstablishments: function(){ return DataLayer._cache.hotels.concat(DataLayer._cache.restaurants); },
  getEstablishmentById: function(id){
    var all = DataLayer.getEstablishments();
    for(var i=0;i<all.length;i++){ if(all[i].id===id) return all[i]; }
    return null;
  },

  // --- Fil d'actualite (posts) ---
  getFeed: function(){ return DataLayer._cache.feed; },

  // --- Messagerie ---
  getClientChats: function(){ return DataLayer._cache.clientChats; },
  getProChats: function(){ return DataLayer._cache.proChats; },

  // --- Publicite / partenaires ---
  getAd: function(){ return DataLayer._cache.ad; },

  // --- Profil connecte (simule pour l'instant) ---
  getCurrentClientName: function(){ return ""; },

  // =================================================================
  // SYNCHRONISATION SUPABASE (progressive, non bloquante)
  // -----------------------------------------------------------------
  // Appelee une fois au demarrage. Charge les vraies donnees si la base
  // est joignable et non vide. En cas d'echec : on garde la demo (UI intacte).
  // Si la base est VIDE : on l'alimente avec la demo (premier deploiement).
  // =================================================================
  syncFromSupabase: function(supabase){
    if(!supabase) return;
    DataLayer._client = supabase; // memorise le client pour les operations CRUD
    try{
      // 1. Etablissements
      supabase.from("establishments").select("*").then(function(res){
        if(res && res.data && res.data.length>0){
          var hotels=[], rests=[];
          res.data.forEach(function(row){
            var obj = row.data || row;
            if(obj.type==="hotel") hotels.push(obj); else rests.push(obj);
          });
          if(hotels.length) DataLayer._cache.hotels = hotels;
          if(rests.length)  DataLayer._cache.restaurants = rests;
          if(DataLayer._onUpdate) DataLayer._onUpdate();
        } else if(res && res.data && res.data.length===0){
          // Base vide : on l'alimente avec la demo (premier lancement)
          DataLayer._seedEstablishments(supabase);
        }
      });
      // 2. Posts
      supabase.from("posts").select("*").then(function(res){
        if(res && res.data && res.data.length>0){
          DataLayer._cache.feed = res.data.map(function(r){ return r.data || r; });
          if(DataLayer._onUpdate) DataLayer._onUpdate();
        } else if(res && res.data && res.data.length===0){
          DataLayer._seedPosts(supabase);
        }
      });
      // 3. Chambres — enrichit les hotels du cache
      supabase.from("establishment_rooms").select("*").then(function(res){
        if(res && res.data && res.data.length>0){
          res.data.forEach(function(row){
            var h = DataLayer._cache.hotels.find(function(x){ return x.id===row.establishment_id; });
            if(h){ if(!h._rooms) h._rooms=[]; h._rooms.push(row); }
          });
          DataLayer._cache.hotels = DataLayer._cache.hotels.map(function(h){
            if(!h._rooms) return h;
            var rooms = h._rooms; delete h._rooms;
            return Object.assign({},h,{rooms:rooms});
          });
          if(DataLayer._onUpdate) DataLayer._onUpdate();
        }
      });
      // 4. Plats — enrichit hotels et restaurants
      supabase.from("establishment_dishes").select("*").then(function(res){
        if(res && res.data && res.data.length>0){
          var byEstab={};
          res.data.forEach(function(row){
            if(!byEstab[row.establishment_id]) byEstab[row.establishment_id]=[];
            byEstab[row.establishment_id].push(row);
          });
          function buildMenu(dishes){
            var cats={};
            dishes.forEach(function(d){ var c=d.category||"Plats"; if(!cats[c])cats[c]=[]; cats[c].push(d); });
            return Object.keys(cats).map(function(c){ return {cat:c,items:cats[c]}; });
          }
          DataLayer._cache.hotels = DataLayer._cache.hotels.map(function(h){
            return byEstab[h.id] ? Object.assign({},h,{menu:buildMenu(byEstab[h.id])}) : h;
          });
          DataLayer._cache.restaurants = DataLayer._cache.restaurants.map(function(r){
            return byEstab[r.id] ? Object.assign({},r,{menu:buildMenu(byEstab[r.id])}) : r;
          });
          if(DataLayer._onUpdate) DataLayer._onUpdate();
        }
      });
      // 5. Services/equipements
      supabase.from("establishment_amenities").select("*").then(function(res){
        if(res && res.data && res.data.length>0){
          var byEstab={};
          res.data.forEach(function(row){
            if(!byEstab[row.establishment_id]) byEstab[row.establishment_id]=[];
            byEstab[row.establishment_id].push(row);
          });
          DataLayer._cache.hotels = DataLayer._cache.hotels.map(function(h){
            return byEstab[h.id] ? Object.assign({},h,{services:byEstab[h.id]}) : h;
          });
          if(DataLayer._onUpdate) DataLayer._onUpdate();
        }
      });
      // 6. Offres restaurants
      supabase.from("establishment_offers").select("*").then(function(res){
        if(res && res.data && res.data.length>0){
          var byEstab={};
          res.data.forEach(function(row){
            if(!byEstab[row.establishment_id]) byEstab[row.establishment_id]=[];
            byEstab[row.establishment_id].push(row);
          });
          DataLayer._cache.restaurants = DataLayer._cache.restaurants.map(function(r){
            return byEstab[r.id] ? Object.assign({},r,{offers:byEstab[r.id]}) : r;
          });
          if(DataLayer._onUpdate) DataLayer._onUpdate();
        }
      });
      // 7. Avis clients (reviews) — re-hydrate localStorage par etablissement
      supabase.from("reviews").select("*").then(function(res){
        if(res && res.data && res.data.length>0){
          var byEstab={};
          res.data.forEach(function(row){
            if(!byEstab[row.establishment_id]) byEstab[row.establishment_id]=[];
            byEstab[row.establishment_id].push({
              id: row.id, rating: row.rating,
              text: row.text||"", date: row.created_at ? new Date(row.created_at).toLocaleDateString("fr-FR") : "",
              author: row.author||"Anonyme"
            });
          });
          try{
            Object.keys(byEstab).forEach(function(eid){
              var key="hp_reviews_"+eid;
              var existing=[];try{existing=JSON.parse(localStorage.getItem(key)||"[]");}catch(ex){}
              var merged=byEstab[eid].concat(existing.filter(function(r){
                return !byEstab[eid].some(function(sr){ return sr.text===r.text&&sr.rating===r.rating; });
              }));
              localStorage.setItem(key,JSON.stringify(merged));
            });
          }catch(ex){}
        }
      });
      // 8. Profils Pro — ajoute les vrais etablissements inscrits au cache
      supabase.from("profiles").select("*").in("account_type",["hotel","restaurant"]).neq("display_name","")
        .then(function(res){
          if(res&&res.data&&res.data.length>0){
            var newHotels=res.data.filter(function(p){return p.account_type==="hotel";}).map(function(p){return{id:"prof_"+p.user_id,userId:p.user_id,name:p.display_name,author:p.display_name,type:"hotel",svcMode:p.svc_mode||"hotel",location:p.location||"",description:p.description||"",img:p.cover_url||"https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=70",verified:p.verified||false,isPremium:p.is_premium||false,services:[],rooms:[],offers:[]};});
            var newRestos=res.data.filter(function(p){return p.account_type==="restaurant";}).map(function(p){return{id:"prof_"+p.user_id,userId:p.user_id,name:p.display_name,author:p.display_name,type:"restaurant",svcMode:"restaurant",location:p.location||"",description:p.description||"",img:p.cover_url||"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=70",verified:p.verified||false,isPremium:p.is_premium||false,services:[],rooms:[],offers:[]};});
            if(newHotels.length){DataLayer._cache.hotels=DataLayer._cache.hotels.filter(function(h){return!h.userId;}).concat(newHotels);}
            if(newRestos.length){DataLayer._cache.restaurants=DataLayer._cache.restaurants.filter(function(r){return!r.userId;}).concat(newRestos);}
            if(DataLayer._onUpdate)DataLayer._onUpdate();
          }
        });
      // 9. Reservations — re-hydrate BookingService depuis Supabase
      supabase.from("reservations").select("*").then(function(res){
        if(res && res.data && res.data.length>0){
          try{
            var existing=[];try{existing=JSON.parse(localStorage.getItem("hp_resas_all")||"[]");}catch(ex){}
            var existingIds=existing.map(function(r){return r.id;});
            var newFromSb=res.data.filter(function(row){ return !existingIds.includes(row.id); })
              .map(function(row){ return row.data ? Object.assign({},row.data,{status:row.status}) : row; });
            if(newFromSb.length>0){
              var merged=existing.concat(newFromSb);
              localStorage.setItem("hp_resas_all",JSON.stringify(merged));
              BookingService._all=merged;
            } else {
              // Mettre a jour les statuts depuis Supabase pour les reservations existantes
              var updated=existing.map(function(r){
                var sbRow=res.data.find(function(row){ return row.id===r.id; });
                return sbRow ? Object.assign({},r,{status:sbRow.status}) : r;
              });
              localStorage.setItem("hp_resas_all",JSON.stringify(updated));
              BookingService._all=updated;
            }
          }catch(ex){}
        }
      });
    }catch(e){ /* hors-ligne ou non configure : on garde la demo */
      // Fix #9 : retry apres 8 secondes si echec au demarrage
      setTimeout(function(){ try{ DataLayer.syncFromSupabase(supabase); }catch(e2){} }, 8000);
    }
  },
  // Alimente la base avec les etablissements de demo (premier deploiement)
  _seedEstablishments: function(supabase){
    // Fix #8 : attendre une session active avant de seeder
    supabase.auth.getSession().then(function(){
      try{
        var rows = HOTELS.concat(RESTAURANTS).map(function(e){
          return { id:e.id, type:e.type, name:e.name, location:e.location,
                   verified:!!e.verified, is_premium:!!e.isPremium, data:e };
        });
        // Fix #7 : re-synchroniser apres insertion pour confirmer
        supabase.from("establishments").insert(rows).then(function(r){
          if(!r.error) DataLayer.syncFromSupabase(supabase);
        });
      }catch(e){}
    }).catch(function(){});
  },
  _seedPosts: function(supabase){
    supabase.auth.getSession().then(function(){
      try{
        var rows = FEED.map(function(p){
          return { id:p.id, author:p.author, type:p.type, data:p };
        });
        supabase.from("posts").insert(rows).then(function(r){
          if(!r.error) DataLayer.syncFromSupabase(supabase);
        });
      }catch(e){}
    }).catch(function(){});
  },

  // =================================================================
  // CRUD DE BASE (read / create / update)
  // -----------------------------------------------------------------
  // Operations generiques et non bloquantes. Chacune renvoie une Promise.
  // Si Supabase n'est pas configure : echoue silencieusement (fallback local).
  // L'UI n'est PAS obligee d'attendre : elle continue avec le cache/mock.
  // =================================================================
  _client: null, // client supabase injecte au demarrage (ou null)

  // READ : lit une table (avec filtre optionnel {colonne: valeur})
  read: function(table, match){
    if(!DataLayer._client) return Promise.resolve({ data: null, error: "no-client" });
    try{
      var q = DataLayer._client.from(table).select("*");
      if(match){ for(var k in match){ if(match.hasOwnProperty(k)) q = q.eq(k, match[k]); } }
      return q;
    }catch(e){ return Promise.resolve({ data: null, error: e }); }
  },
  // CREATE : insere une ou plusieurs lignes
  create: function(table, rows){
    if(!DataLayer._client) return Promise.resolve({ data: null, error: "no-client" });
    try{ return DataLayer._client.from(table).insert(rows).select(); }
    catch(e){ return Promise.resolve({ data: null, error: e }); }
  },
  // UPDATE simple : met a jour les lignes correspondant a {colonne: valeur}
  update: function(table, match, changes){
    if(!DataLayer._client) return Promise.resolve({ data: null, error: "no-client" });
    try{
      var q = DataLayer._client.from(table).update(changes);
      for(var k in match){ if(match.hasOwnProperty(k)) q = q.eq(k, match[k]); }
      return q;
    }catch(e){ return Promise.resolve({ data: null, error: e }); }
  },

  // --- Raccourcis metier (utilisent le CRUD ci-dessus) ---
  // Enregistre une reservation dans Supabase (en plus de l'etat local)
  saveReservation: function(resa, clientId){
    return DataLayer.create("reservations", [{
      id: resa.id, client_id: clientId || null,
      estab_id: resa.estab||resa.id||null, estab_type: resa.estabType||resa.type||null,
      status: resa.status||"pending", data: resa
    }]);
  },
  // Enregistre un message dans Supabase
  saveMessage: function(conversationId, msg){
    return DataLayer.create("messages", [{
      conversation_id: conversationId, sender: msg.f,
      body: msg.t, deleted: !!msg.deleted, read: !!msg.read,
      reply_to: msg.replyTo || null
    }]);
  },

  // UPSERT : insere ou met a jour selon la cle de conflit
  upsert: function(table, rows, onConflict){
    if(!DataLayer._client) return Promise.resolve({ data: null, error: "no-client" });
    try{
      var q = DataLayer._client.from(table).upsert(rows, onConflict ? { onConflict: onConflict } : undefined);
      return q;
    }catch(e){ return Promise.resolve({ data: null, error: e }); }
  },

  // --- Sauvegarde des donnees metier etablissement ---
  saveEstabRooms: function(estabId, rooms){
    if(!DataLayer._client||!estabId) return;
    try{
      var rows = rooms.map(function(r){
        return { id: r.id, establishment_id: estabId, name: r.name,
                 price: r.price||0, capacity: r.capacity||2,
                 available: r.available!==false, stock: r.stock||1,
                 description: r.description||null };
      });
      DataLayer._client.from("establishment_rooms")
        .delete().eq("establishment_id", estabId).then(function(){
          if(rows.length) DataLayer._client.from("establishment_rooms").insert(rows).then(function(){});
        });
    }catch(e){}
  },
  saveEstabDishes: function(estabId, dishes){
    if(!DataLayer._client||!estabId) return;
    try{
      var rows = dishes.map(function(d){
        return { id: d.id, establishment_id: estabId, name: d.name,
                 price: d.price||0, category: d.category||"Plats",
                 description: d.description||null, available: d.available!==false };
      });
      DataLayer._client.from("establishment_dishes")
        .delete().eq("establishment_id", estabId).then(function(){
          if(rows.length) DataLayer._client.from("establishment_dishes").insert(rows).then(function(){});
        });
    }catch(e){}
  },
  saveEstabAmenities: function(estabId, amenities){
    if(!DataLayer._client||!estabId) return;
    try{
      var rows = amenities.map(function(a){
        return { id: a.id, establishment_id: estabId, name: a.name, active: a.active!==false };
      });
      DataLayer._client.from("establishment_amenities")
        .delete().eq("establishment_id", estabId).then(function(){
          if(rows.length) DataLayer._client.from("establishment_amenities").insert(rows).then(function(){});
        });
    }catch(e){}
  },
  saveEstabOffers: function(estabId, offers){
    if(!DataLayer._client||!estabId) return;
    try{
      var rows = offers.map(function(o){
        return { id: o.id, establishment_id: estabId, name: o.name,
                 price: o.price||null, available: o.available!==false };
      });
      DataLayer._client.from("establishment_offers")
        .delete().eq("establishment_id", estabId).then(function(){
          if(rows.length) DataLayer._client.from("establishment_offers").insert(rows).then(function(){});
        });
    }catch(e){}
  },
  saveEstabDescription: function(estabId, description){
    if(!DataLayer._client||!estabId||!description) return;
    try{
      DataLayer._client.from("establishments")
        .update({ description: description }).eq("id", estabId).then(function(){});
    }catch(e){}
  },
  saveReview: function(estabId, review, clientId){
    if(!DataLayer._client||!estabId||!review) return;
    try{
      DataLayer._client.from("reviews").insert([{
        establishment_id: estabId,
        user_id: clientId||null,
        rating: review.rating,
        text: review.text||null,
        author: review.author||"Anonyme"
      }]).then(function(res){
        if(res&&res.error) console.warn("[DataLayer] saveReview error:", res.error.message);
      });
    }catch(e){ console.warn("[DataLayer] saveReview exception:", e); }
  },
  updateReservationStatus: function(id, status, clientId){
    if(!DataLayer._client||!id||!status) return;
    var VALID_STATUSES = ["confirmed","pending","cancelled","completed"];
    if(VALID_STATUSES.indexOf(status)<0){ console.warn("[DataLayer] statut invalide:", status); return; }
    try{
      var query = DataLayer._client.from("reservations").update({ status: status }).eq("id", id);
      if(clientId) query = query.eq("client_id", clientId);
      query.then(function(res){
        if(res&&res.error) console.warn("[DataLayer] updateReservationStatus error:", res.error.message);
      });
    }catch(e){ console.warn("[DataLayer] updateReservationStatus exception:", e); }
  },

  // Upload photo profil vers Supabase Storage — retourne l'URL publique via onSuccess(url)
  uploadProfilePhoto: function(file, userId, accountType, onSuccess){
    if(!DataLayer._client||!file||!userId){ if(onSuccess)onSuccess(null); return; }
    var ext = (file.name||"photo").split(".").pop().toLowerCase()||"jpg";
    var path = userId+"/profile."+ext;
    DataLayer._client.storage.from("profile-photos")
      .upload(path, file, { upsert: true, contentType: file.type||"image/jpeg" })
      .then(function(res){
        if(res.error){ if(onSuccess)onSuccess(null); return; }
        var urlRes = DataLayer._client.storage.from("profile-photos").getPublicUrl(path);
        var publicUrl = urlRes&&urlRes.data&&urlRes.data.publicUrl ? urlRes.data.publicUrl : null;
        if(publicUrl && userId){
          DataLayer._client.from("profiles")
            .upsert([{ user_id: userId, photo_url: publicUrl, account_type: accountType||"client" }],
              { onConflict: "user_id", ignoreDuplicates: false })
            .then(function(){});
        }
        if(onSuccess) onSuccess(publicUrl);
      });
  },

  // Sync photo profil depuis Supabase au démarrage
  syncProfilePhoto: function(userId, onPhotoUrl){
    if(!DataLayer._client||!userId||!onPhotoUrl) return;
    DataLayer._client.from("profiles")
      .select("photo_url").eq("user_id", userId).maybeSingle()
      .then(function(res){
        if(res&&res.data&&res.data.photo_url) onPhotoUrl(res.data.photo_url);
      });
  },

  uploadCoverPhoto: function(file, userId, accountType, onSuccess){
    if(!DataLayer._client||!file||!userId){ if(onSuccess)onSuccess(null); return; }
    var ext = (file.name||"cover").split(".").pop().toLowerCase()||"jpg";
    var path = userId+"/cover."+ext;
    DataLayer._client.storage.from("profile-photos")
      .upload(path, file, { upsert: true, contentType: file.type||"image/jpeg" })
      .then(function(res){
        if(res.error){ if(onSuccess)onSuccess(null); return; }
        var urlRes = DataLayer._client.storage.from("profile-photos").getPublicUrl(path);
        var publicUrl = urlRes&&urlRes.data&&urlRes.data.publicUrl ? urlRes.data.publicUrl : null;
        if(publicUrl && userId){
          DataLayer._client.from("profiles")
            .upsert([{ user_id: userId, cover_url: publicUrl, account_type: accountType||"hotel" }],
              { onConflict: "user_id", ignoreDuplicates: false })
            .then(function(){});
        }
        if(onSuccess) onSuccess(publicUrl);
      });
  },

  syncCoverPhoto: function(userId, onCoverUrl){
    if(!DataLayer._client||!userId||!onCoverUrl) return;
    DataLayer._client.from("profiles")
      .select("cover_url").eq("user_id", userId).maybeSingle()
      .then(function(res){
        if(res&&res.data&&res.data.cover_url) onCoverUrl(res.data.cover_url);
      });
  }
};

// =====================================================================
// COUCHE D'AUTHENTIFICATION CENTRALISEE (AuthService)
// ---------------------------------------------------------------------
// Point d'acces unique a la connexion / inscription / deconnexion.
// Aujourd'hui : valide localement (mode demonstration, sans serveur).
// Demain : remplacer l'interieur de chaque fonction par un appel reel
// (ex. Supabase Auth, Firebase Auth) SANS toucher aux ecrans.
// Exemple futur :
//   login: async function(email,pwd){
//     const { data, error } = await supabase.auth.signInWithPassword({email,password:pwd});
//     if(error) throw error;
//     return mapUser(data.user);
//   }
// =====================================================================
var AuthService = {
  _sb: function(){ return (typeof window!=="undefined"&&window.__supabase)||null; },
  buildSession: function(accType, status, email, userId){
    return {
      type: accType,
      accountStatus: status || "active",
      email: email || "",
      userId: userId || null,
      suspendReason: null,
      banReason: null,
      refuseReason: null
    };
  },
  login: async function(accType, email, password){
    var sb = AuthService._sb();
    if(sb){
      var r = await sb.auth.signInWithPassword({ email: email, password: password });
      if(r.error) throw r.error;
      var userId = r.data.user.id;
      var realType = accType;
      var realStatus = "active";
      try{
        var prof = await sb.from("profiles").select("account_type,status").eq("user_id", userId).single();
        if(prof.data && prof.data.account_type) realType = prof.data.account_type;
        if(prof.data && prof.data.status) realStatus = prof.data.status;
      }catch(_){}
      return AuthService.buildSession(realType, realStatus, r.data.user.email, userId);
    }
    return AuthService.buildSession(accType, "active", email || "demo@platform.com");
  },
  register: async function(accType, email, password){
    var sb = AuthService._sb();
    if(sb){
      var r = await sb.auth.signUp({ email: email, password: password, options: { data: { account_type: accType }, emailRedirectTo: window.location.origin } });
      if(r.error) throw r.error;
      var status = accType !== "client" ? "pending" : "active";
      var s = AuthService.buildSession(accType, status, (r.data.user&&r.data.user.email)||email, r.data.user&&r.data.user.id);
      s.needsEmailConfirm = !r.data.session;
      if(r.data.user&&r.data.user.id){try{sb.from("profiles").upsert([{user_id:r.data.user.id,display_name:"",account_type:accType,svc_mode:accType==="client"?"client":accType,location:""}]).then(function(){});}catch(e){}}
      return s;
    }
    var status = accType !== "client" ? "pending" : "active";
    return AuthService.buildSession(accType, status, email || "demo@platform.com");
  },
  loginWithProvider: async function(accType, provider){
    var sb = AuthService._sb();
    if(sb){
      await sb.auth.signInWithOAuth({ provider: provider, options: { redirectTo: window.location.origin } });
      return null;
    }
    return AuthService.buildSession(accType, "active", provider + "@gmail.com");
  },
  logout: async function(){
    var sb = AuthService._sb();
    if(sb) await sb.auth.signOut();
    return null;
  }
};

// =====================================================================
// COUCHE RESERVATIONS CENTRALISEE (BookingService)
// ---------------------------------------------------------------------
// Point d'acces unique a la creation et la lecture des reservations.
// Aujourd'hui : stocke en memoire de session (perdu a la fermeture).
// Demain : remplacer l'interieur par des appels base de donnees
// (ex. Supabase table "reservations") SANS toucher aux ecrans.
// Exemple futur :
//   createBooking: async function(resa){
//     const { data, error } = await supabase.from("reservations").insert(resa).select().single();
//     if(error) throw error; return data;
//   }
//   getClientBookings: async function(userId){
//     const { data } = await supabase.from("reservations").select("*").eq("client_id",userId);
//     return data || [];
//   }
// =====================================================================
var BookingService = {
  _all: (function(){try{return JSON.parse(localStorage.getItem("hp_resas_all")||"[]");}catch(e){return [];}}()),
  generateId: function(){
    return "R" + Date.now().toString().slice(-8);
  },
  createBooking: function(resa,clientId){
    if(!resa) return null;
    if(!resa.id){ resa.id = BookingService.generateId(); }
    if(!resa.createdAt){ resa.createdAt = new Date().toISOString(); }
    BookingService._all.push(resa);
    try{localStorage.setItem("hp_resas_all",JSON.stringify(BookingService._all));}catch(e){}
    try{ if(DataLayer._client){ DataLayer.saveReservation(resa,clientId||null).then(function(){}); } }catch(e){}
    return resa;
  },
  getAll: function(){ return BookingService._all.slice(); },
  appendToHistory: function(history, resa){
    return (history || []).concat([resa]);
  }
};

// =====================================================================
// COUCHE MESSAGERIE CENTRALISEE (MessageService)
// ---------------------------------------------------------------------
// Point d'acces unique a l'envoi, la suppression et le statut des messages.
// Aujourd'hui : stocke en memoire de session (perdu a la fermeture).
// Demain : remplacer l'interieur par des appels temps reel
// (ex. Supabase Realtime, ou websockets) SANS toucher aux ecrans.
// Exemple futur :
//   sendMessage: async function(convId,text,replyTo){
//     const msg = MessageService.buildMessage(text, replyTo);
//     await supabase.from("messages").insert({ conversation_id: convId, ...msg });
//     return msg;
//   }
//   subscribeToConversation: function(convId, onNewMessage){
//     return supabase.channel("conv:"+convId)
//       .on("postgres_changes",{event:"INSERT",schema:"public",table:"messages",filter:"conversation_id=eq."+convId}, onNewMessage)
//       .subscribe();
//   }
// =====================================================================
var MessageService = {
  // Horodatage court HH:MM
  timeNow: function(){
    var now = new Date();
    var mn = now.getMinutes();
    return now.getHours() + ":" + (mn < 10 ? "0" : "") + mn;
  },
  // Construit un nouvel objet message sortant ("me")
  buildMessage: function(text, replyTo){
    return {
      id: Date.now(),
      f: "me",
      t: text,
      time: MessageService.timeNow(),
      read: false,
      replyTo: replyTo ? { t: replyTo.t, f: replyTo.f } : null,
      createdAt: new Date().toISOString()
    };
  },
  // Marque un message comme supprime (sans le retirer, facon messageries pro)
  markDeleted: function(msg, id){
    return msg.id === id
      ? Object.assign({}, msg, { deleted: true, t: "[Message supprimé]" })
      : msg;
  },
  // Marque un message comme lu
  markRead: function(msg){
    return Object.assign({}, msg, { read: true });
  }
};


var SVC_MAP={spa:Waves,piscine:Waves,gym:Dumbbell,parking:Car,wifi:Wifi,restaurant:Utensils,bar:Utensils,chambre:Package,suite:Star,default:Package};
function getIcon(name){name=typeof name==='object'&&name!==null?(name.name||''):(name||'');var n=(name||"").toLowerCase();for(var k in SVC_MAP){if(n.indexOf(k)>=0)return SVC_MAP[k];}return SVC_MAP.default;}

function useToast(){
  var st=useState(null);var toast=st[0];var setToast=st[1];
  var timer={current:null};
  function show(msg,type){if(!type)type="success";if(timer.current)clearTimeout(timer.current);setToast({msg:msg,type:type});timer.current=setTimeout(function(){setToast(null);},2400);}
  function Toast(){
    if(!toast)return null;
    var bg={success:DS.success,error:DS.error,info:DS.info,warning:DS.warning,neutral:DS.textDim}[toast.type]||DS.card;
    var icon={success:"✓",error:"✕",info:"ℹ",warning:"⚠"}[toast.type]||"";
    return(<div onClick={function(){setToast(null);}} style={{position:"fixed",bottom:96,left:"50%",transform:"translateX(-50%)",zIndex:9999,background:bg,color:"#fff",padding:"11px 22px",borderRadius:30,fontSize:13,fontWeight:700,whiteSpace:"nowrap",cursor:"pointer",display:"flex",alignItems:"center",gap:8,boxShadow:"0 8px 32px rgba(0,0,0,.45)",animation:"hp-toast-in .28s cubic-bezier(0.22,1,0.36,1)"}}>{icon&&<span style={{fontSize:14}}>{icon}</span>}{toast.msg}</div>);
  }
  return {show:show,Toast:Toast};
}

function VBadge(props){
  var sz=props.sz||22;var showLabel=props.showLabel||false;
  var star=(<svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" style={{display:"block",filter:"drop-shadow(0 0 3px #FFD700aa)"}}><defs><linearGradient id="vbg" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#FFF176"/><stop offset="40%" stopColor="#FFD700"/><stop offset="100%" stopColor="#B45309"/></linearGradient><radialGradient id="vshine" cx="35%" cy="30%" r="55%"><stop offset="0%" stopColor="#FFFDE7" stopOpacity="0.85"/><stop offset="100%" stopColor="#FFD700" stopOpacity="0"/></radialGradient></defs><path d="M12 1.5L14.39 8.26L21.5 8.27L15.82 12.49L18.21 19.25L12 15.02L5.79 19.25L8.18 12.49L2.5 8.27L9.61 8.26Z" fill="url(#vbg)" stroke="#92400E" strokeWidth="0.4"/><path d="M12 1.5L14.39 8.26L21.5 8.27L15.82 12.49L18.21 19.25L12 15.02L5.79 19.25L8.18 12.49L2.5 8.27L9.61 8.26Z" fill="url(#vshine)"/><path d="M8.5 12L11 14.5L15.5 9.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
  if(!showLabel)return(<div style={{width:sz,height:sz,borderRadius:"50%",background:"#111",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 6px 2px #FFD70066,0 2px 6px rgba(0,0,0,.6)",flexShrink:0}}>{star}</div>);
  var circSz=sz;var lblFontSz=Math.max(9,Math.round(sz*0.45));
  return(
    <div style={{display:"inline-flex",flexDirection:"column",alignItems:"center",gap:0,flexShrink:0}}>
      <div style={{width:circSz,height:circSz,borderRadius:"50%",background:"#111",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 8px 3px #FFD70066,0 2px 8px rgba(0,0,0,.7)"}}>{star}</div>
      <div style={{background:"#14532d",borderRadius:"0 0 6px 6px",padding:"1px 5px",marginTop:-3,boxShadow:"0 2px 4px rgba(0,0,0,.4)"}}><span style={{fontSize:lblFontSz,fontWeight:800,color:"#4ade80",letterSpacing:"0.01em",whiteSpace:"nowrap"}}>Vérifié</span></div>
    </div>
  );
}
function CBadge(props){var sz=props.sz||22;return(<svg width={sz} height={sz} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#2563EB"/><path d="M7.5 12L10.5 15L16.5 9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>);}
function BackBtn(props){
  var onClick=props.onClick;var light=props.light||false;
  var iconColor=light?"#fff":DS.text;
  var bg=light?"rgba(0,0,0,.45)":DS.card;
  var bd=light?"rgba(255,255,255,.18)":DS.border;
  return(<button onClick={onClick} style={{background:bg,border:"1px solid "+bd,borderRadius:"50%",width:44,height:44,minWidth:44,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:0,flexShrink:0,boxShadow:light?"0 2px 8px rgba(0,0,0,.3)":"0 1px 3px rgba(0,0,0,.4)"}}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 5L8 12L15 19" stroke={iconColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
  </button>);
}

function Av(props){
  var sz=props.sz||40;var letter=props.letter||"?";var img=props.img||null;var verified=props.verified||false;var isClient=props.isClient||false;
  var badge=verified?(<div style={{position:"absolute",bottom:-2,right:-2,background:DS.bg,borderRadius:"50%",padding:1}}>{isClient?<CBadge sz={Math.round(sz*.38)}/>:<VBadge sz={Math.round(sz*.36)}/>}</div>):null;
  return(<div style={{position:"relative",width:sz,height:sz,flexShrink:0}}><div style={{position:"absolute",inset:0,borderRadius:"50%",background:DS.primary+"30",display:"flex",alignItems:"center",justifyContent:"center",fontSize:Math.round(sz*.4),fontWeight:800,color:DS.primary}}>{letter}</div>{img&&<img src={img} alt="" onError={function(e){e.currentTarget.style.display="none";}} style={{position:"absolute",inset:0,width:sz,height:sz,borderRadius:"50%",objectFit:"cover"}}/>}{badge}</div>);
}
function ImgViewer(props){
  var src=props.src;var onClose=props.onClose;
  if(!src)return null;
  return(<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",animation:"hp-fade 0.18s ease"}}><img src={src} alt="" style={{maxWidth:"92vw",maxHeight:"88vh",objectFit:"contain",borderRadius:12,boxShadow:"0 24px 64px rgba(0,0,0,.7)"}}/><button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"rgba(255,255,255,.12)",border:"none",borderRadius:"50%",width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><X size={18} color="#fff"/></button></div>);
}
function CamBadge(props){
  var uploadRef=props.uploadRef;var sz=props.sz||24;
  return(<div onClick={function(e){e.stopPropagation();if(uploadRef&&uploadRef.current)uploadRef.current.click();}} style={{width:sz,height:sz,borderRadius:"50%",background:DS.card,border:"2px solid "+DS.bg,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 2px 6px rgba(0,0,0,.5)"}}><Camera size={Math.round(sz*.5)} color={DS.textMuted}/></div>);
}
function DualAv(props){
  var sz=props.sz||72;var letter=props.letter||"?";var innerImg=props.innerImg||null;var outerImg=props.outerImg||null;var verified=props.verified||false;var isClient=props.isClient||false;var onClickInner=props.onClickInner||null;var onClickOuter=props.onClickOuter||null;var uploadRef=props.uploadRef||null;
  var ring=8;var outerSz=sz+ring*2;var badgeSz=Math.round(sz*.34);
  return(
    <div style={{position:"relative",width:outerSz,height:outerSz,flexShrink:0}}>
      <div onClick={onClickOuter} style={{position:"absolute",inset:0,borderRadius:"50%",overflow:"hidden",cursor:onClickOuter?"pointer":"default",background:DS.card,border:"2px solid "+DS.border}}>
        {outerImg&&<img src={outerImg} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:.75}}/>}
      </div>
      <div style={{position:"absolute",top:ring,left:ring,width:sz,height:sz,borderRadius:"50%",border:"2.5px solid "+DS.bg,overflow:"hidden",boxSizing:"border-box"}}>
        <div onClick={onClickInner} style={{width:"100%",height:"100%",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
          {innerImg?<img src={innerImg} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block",pointerEvents:"none"}}/>:<div style={{width:"100%",height:"100%",background:DS.primary+"30",display:"flex",alignItems:"center",justifyContent:"center",fontSize:Math.round(sz*.38),fontWeight:800,color:DS.primary}}>{letter}</div>}
        </div>
      </div>
      {uploadRef&&<div style={{position:"absolute",bottom:ring,right:ring,zIndex:5}}><CamBadge uploadRef={uploadRef} sz={badgeSz}/></div>}
      {verified&&!uploadRef&&<div style={{position:"absolute",bottom:ring-2,right:ring-2,background:DS.bg,borderRadius:"50%",padding:1,zIndex:4}}>{isClient?<CBadge sz={badgeSz}/>:<VBadge sz={badgeSz}/>}</div>}
    </div>
  );
}

function Stars(props){var r=props.r||0;var sz=props.sz||14;return(<span style={{display:"inline-flex",gap:2}}>{[1,2,3,4,5].map(function(i){return <Star key={i} size={sz} fill={i<=r?"#F59E0B":"none"} color={i<=r?"#F59E0B":DS.border} strokeWidth={1.5}/>;})}</span>);}

function Emp(props){var Icon=props.Icon||Package;var title=props.title||"";var sub=props.sub||"";return(<div style={{padding:"48px 20px",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:10}}><Icon size={40} color={DS.textDim} strokeWidth={1}/><div style={{fontSize:15,fontWeight:700,color:DS.textMuted}}>{title}</div>{sub&&<div style={{fontSize:12,color:DS.textDim,maxWidth:240}}>{sub}</div>}</div>);}
function Sk(props){var w=props.w||"100%";var h=props.h||14;var r=props.r||8;return(<div className="hp-sk" style={{width:w,height:h,borderRadius:r,flexShrink:0}}/>);}
function FeedSkeleton(){return(<div style={{animation:"hp-fade .2s ease"}}>{[0,1,2].map(function(i){return(<div key={i} style={{background:DS.surface,marginBottom:10,padding:"18px 16px",borderTop:"1px solid "+DS.border+"28",borderBottom:"1px solid "+DS.border+"28"}}><div style={{display:"flex",gap:12,marginBottom:14}}><div className="hp-sk" style={{width:52,height:52,borderRadius:"50%",flexShrink:0}}/><div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}><Sk h={13} w="55%"/><Sk h={10} w="35%"/><Sk h={9} w="20%"/></div></div><Sk h={13} w="90%" r={6}/><div style={{marginTop:6}}><Sk h={13} w="70%" r={6}/></div><div className="hp-sk" style={{width:"100%",height:220,borderRadius:0,margin:"14px 0 0"}}/><div style={{display:"flex",gap:8,marginTop:14}}><Sk h={10} w="25%"/><Sk h={10} w="25%"/><Sk h={10} w="20%"/></div></div>);})}</div>);}

function DiscSkeleton(){return(<div style={{animation:"hp-fade .2s ease"}}>{[0,1,2].map(function(i){return(<div key={i} style={{marginBottom:12,background:DS.card,borderRadius:16,overflow:"hidden",border:"1px solid "+DS.border}}><div className="hp-sk" style={{width:"100%",height:160,borderRadius:0,flexShrink:0}}/><div style={{padding:"12px 14px"}}><Sk h={15} w="65%"/><div style={{marginTop:6}}><Sk h={11} w="45%"/></div></div><div style={{padding:"8px 14px 14px",display:"flex",gap:8}}><Sk h={34} w="48%" r={10}/><Sk h={34} w="48%" r={10}/></div></div>);})}</div>);}
function ProfSkeleton(){return(<div style={{animation:"hp-fade .2s ease",paddingBottom:20}}><div style={{background:DS.card,borderBottom:"1px solid "+DS.border,padding:"16px 16px 12px",textAlign:"center"}}><div className="hp-sk" style={{width:72,height:72,borderRadius:"50%",margin:"0 auto 12px"}}/><Sk h={18} w="45%" r={8}/><div style={{margin:"6px auto 0",width:"60%"}}><Sk h={12} w="100%"/></div></div><div style={{display:"flex",margin:"12px 16px",background:DS.card,borderRadius:12,border:"1px solid "+DS.border,overflow:"hidden"}}>{[0,1,2].map(function(i){return <div key={i} style={{flex:1,padding:"9px 0",textAlign:"center",borderRight:i<2?"1px solid "+DS.border:"none"}}><Sk h={18} w="60%" r={4}/><div style={{marginTop:4,display:"flex",justifyContent:"center"}}><Sk h={10} w="50%"/></div></div>;})}</div><div style={{padding:"0 16px"}}>{[0,1,2].map(function(i){return <div key={i} style={{background:DS.card,borderRadius:14,marginBottom:12,border:"1px solid "+DS.border,padding:"14px"}}><Sk h={14} w="60%"/><div style={{marginTop:6}}><Sk h={11} w="40%"/></div></div>;})}</div></div>);}
function NotifSkeleton(){return(<div style={{animation:"hp-fade .2s ease"}}>{[0,1,2,3].map(function(i){return(<div key={i} style={{display:"flex",gap:12,padding:"14px 16px",borderBottom:"1px solid "+DS.border+"20"}}><div className="hp-sk" style={{width:40,height:40,borderRadius:"50%",flexShrink:0}}/><div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}><Sk h={13} w="55%"/><Sk h={11} w="80%"/><Sk h={9} w="20%"/></div></div>);})}</div>);}
function ChatListSkeleton(){return(<div style={{animation:"hp-fade .2s ease"}}>{[0,1,2,3].map(function(i){return(<div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:"1px solid "+DS.border+"20"}}><div className="hp-sk" style={{width:46,height:46,borderRadius:"50%",flexShrink:0}}/><div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}><div style={{display:"flex",justifyContent:"space-between"}}><Sk h={13} w="45%"/><Sk h={10} w="15%"/></div><Sk h={11} w="70%"/></div></div>);})}</div>);}
function ResaSkeleton(){return(<div style={{padding:"0 14px",animation:"hp-fade .2s ease"}}>{[0,1,2].map(function(i){return(<div key={i} style={{background:DS.card,borderRadius:14,padding:"14px",marginBottom:12,border:"1px solid "+DS.border}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><div style={{flex:1,display:"flex",flexDirection:"column",gap:7}}><Sk h={14} w="60%"/><Sk h={11} w="40%"/><Sk h={10} w="55%"/></div><div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}><Sk h={16} w={70} r={6}/><Sk h={10} w={50} r={6}/></div></div><div style={{display:"flex",gap:6}}><Sk h={30} w={80} r={8}/><Sk h={30} w={80} r={8}/></div></div>);})}</div>);}

function AdBanner(){
  var si=useState(0);var adIdx=si[0];var setAdIdx=si[1];
  useEffect(function(){var t=setInterval(function(){setAdIdx(function(i){return(i+1)%ADS_POOL.length;});},6000);return function(){clearInterval(t);};},[]);
  var AD=ADS_POOL[adIdx];if(!AD||!AD.active)return null;
  return(
    <div key={adIdx} style={{margin:"6px 14px",padding:"7px 14px",background:DS.goldSoft,border:"1px solid "+DS.gold+"33",borderRadius:10,display:"flex",alignItems:"center",gap:8,animation:"hp-fade 0.4s ease"}}>
      <Tag size={11} color={DS.gold}/>
      <div style={{flex:1,minWidth:0}}>
        <span style={{fontSize:9,fontWeight:800,color:DS.gold,letterSpacing:1}}>{AD.label} · </span>
        <span style={{fontSize:9,fontWeight:800,color:DS.gold}}>{AD.estab} · </span>
        <span style={{fontSize:10,color:DS.textMuted}}>{AD.text}</span>
      </div>
    </div>
  );
}

function SplashAd(props){
  var onClose=props.onClose;
  var sC=useState(false);var closing=sC[0];var setClosing=sC[1];
  function handleClose(){setClosing(true);setTimeout(function(){onClose();},260);}
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",zIndex:2000,display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"hp-fade 0.3s ease"}}>
      <div style={{width:"100%",maxWidth:420,background:DS.surface,borderRadius:"22px 22px 0 0",border:"1px solid "+DS.border,animation:closing?"hp-sheet-out 0.26s ease forwards":"hp-slide-up 0.32s ease",overflow:"hidden"}}>
        <div style={{position:"relative"}}>
          <img src={SPLASH_AD.img} alt={SPLASH_AD.estab} style={{width:"100%",height:220,objectFit:"cover",display:"block"}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom, transparent 40%, rgba(0,0,0,.7) 100%)"}}/>
          <div style={{position:"absolute",top:12,left:14,background:DS.gold,borderRadius:6,padding:"3px 8px",display:"flex",alignItems:"center",gap:4}}>
            <Tag size={9} color="#000"/>
            <span style={{fontSize:9,fontWeight:900,color:"#000",letterSpacing:1}}>{SPLASH_AD.label}</span>
          </div>
          <button onClick={handleClose} style={{position:"absolute",top:10,right:10,background:"rgba(0,0,0,.5)",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <X size={14} color="#fff"/>
          </button>
          <div style={{position:"absolute",bottom:14,left:14,right:14}}>
            <div style={{fontSize:16,fontWeight:900,color:"#fff",marginBottom:2}}>{SPLASH_AD.estab}</div>
          </div>
        </div>
        <div style={{padding:"16px 20px 24px"}}>
          <p style={{fontSize:13,color:DS.textMuted,lineHeight:1.6,margin:"0 0 16px"}}>{SPLASH_AD.text}</p>
          <button onClick={handleClose} style={{width:"100%",padding:"12px",background:DS.gold,border:"none",borderRadius:12,color:"#000",fontSize:14,fontWeight:900,cursor:"pointer",marginBottom:10}}>{SPLASH_AD.cta}</button>
          <button onClick={handleClose} style={{width:"100%",padding:"8px",background:"none",border:"none",color:DS.textMuted,fontSize:12,cursor:"pointer"}}>Ignorer</button>
        </div>
      </div>
    </div>
  );
}

function OffB(props){return(<button onClick={props.onPress} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid "+DS.border+"20",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}><span style={{fontSize:14,color:DS.text}}>{props.label}</span><ChevronRight size={16} color={DS.textMuted}/></button>);}

function LoyaltyWidget(props){
  var points=props.points||620;var level=props.level||"silver";
  var LEVELS=[{id:"bronze",name:"Bronze",min:0,color:"#CD7F32"},{id:"silver",name:"Argent",min:1000,color:"#9CA3AF"},{id:"gold",name:"Or",min:5000,color:DS.gold},{id:"plat",name:"Platine",min:15000,color:"#E5E4E2"}];
  var lv=LEVELS.find(function(l){return l.id===level;})||LEVELS[0];
  var next=LEVELS[LEVELS.indexOf(lv)+1];
  var progress=next?((points-lv.min)/(next.min-lv.min))*100:100;
  return(<div style={{background:DS.card,border:"1px solid "+lv.color+"33",borderRadius:12,padding:"10px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}><div style={{width:28,height:28,borderRadius:"50%",background:lv.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Star size={14} color={lv.color} fill={lv.color}/></div><div style={{flex:1,minWidth:0}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:11,fontWeight:800,color:lv.color}}>Fidelite {lv.name}</span><span style={{fontSize:13,fontWeight:900,color:lv.color}}>{points.toLocaleString()} pts</span></div>{next&&<div style={{height:4,background:DS.border,borderRadius:2}}><div style={{height:4,borderRadius:2,background:lv.color,width:Math.min(100,progress)+"%",transition:"width .5s"}}/></div>}</div></div>);
}

function TopBar(props){return(<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:DS.surface,borderBottom:"1px solid "+DS.border,position:"sticky",top:0,zIndex:50}}><div style={{display:"flex",alignItems:"center",gap:8,minWidth:40}}>{props.left}</div><div style={{flex:1,textAlign:"center"}}>{props.center}</div><div style={{display:"flex",alignItems:"center",gap:8,minWidth:40,justifyContent:"flex-end"}}>{props.right}</div></div>);}

function BotNav(props){
  var tabs=props.tabs;var active=props.active;var set=props.set;var accent=props.accent;var onHomeRefresh=props.onHomeRefresh;
  var sTap=useState(null);var tapped=sTap[0];var setTapped=sTap[1];
  function tap(id){
    setTapped(id);setTimeout(function(){setTapped(null);},200);
    if(id==="feed"&&active===id&&onHomeRefresh)onHomeRefresh();else set(id);
  }
  return(<div style={{position:"sticky",bottom:0,background:DS.surface,borderTop:"1px solid "+DS.border,display:"flex",zIndex:100,paddingBottom:"env(safe-area-inset-bottom)"}}>{tabs.map(function(tab){var Icon=tab.icon;var id=tab.id;var isAct=active===id;var isTapped=tapped===id;return(<button key={id} onClick={function(){tap(id);}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"9px 0 7px",background:"none",border:"none",cursor:"pointer",gap:3,transform:isTapped?"scale(.88)":"scale(1)",transition:"transform .14s cubic-bezier(0.22,1,0.36,1)"}}><Icon size={22} color={isAct?accent:DS.textMuted} strokeWidth={isAct?2.5:1.5}/><div style={{fontSize:9,fontWeight:isAct?800:400,color:isAct?accent:DS.textMuted,transition:"color .18s"}}>{tab.label}</div><div style={{width:isAct?18:0,height:2.5,borderRadius:2,background:accent,transition:"width .25s cubic-bezier(0.22,1,0.36,1)"}}/></button>);})}</div>);
}

function Ov(props){
  var onClose=props.onClose;
  var sc=useState(false);var closing=sc[0];var setClosing=sc[1];
  function handleClose(){
    if(closing)return;
    setClosing(true);
    setTimeout(function(){if(onClose)onClose();},260);
  }
  return(<div style={{position:"fixed",inset:0,background:DS.bg,zIndex:850,maxWidth:420,margin:"0 auto",overflowY:"auto",WebkitOverflowScrolling:"touch",touchAction:"pan-y",animation:(closing?"hp-slide-out-right 0.26s cubic-bezier(0.4,0,1,1) forwards":"hp-slide-right 0.32s cubic-bezier(0.22,1,0.36,1)"),boxShadow:"-8px 0 24px rgba(0,0,0,.35)"}}>{typeof props.children==="function"?props.children(handleClose):props.children}</div>);
}

function AccountTypeScreen(props){
  var onSelect=props.onSelect;
  return(
    <div style={{minHeight:"100vh",background:DS.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,animation:"hp-fade-up 0.28s ease"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontSize:32,fontWeight:900,color:DS.text,letterSpacing:-1}}>HotelPlatform <span style={{color:DS.client}}>Travel</span></div>
        <div style={{fontSize:13,color:DS.textMuted,marginTop:8}}>Choisissez votre type de compte</div>
      </div>
      <div style={{width:"100%",maxWidth:360,display:"flex",flexDirection:"column",gap:14}}>
        {[["client","Client","Voyageur · Réservations · Avis",User,DS.client],["hotel","Hotel","Gérez votre établissement hôtelier",Building2,DS.hotel],["restaurant","Restaurant","Gérez votre restaurant",Utensils,DS.restaurant]].map(function(item){
          var t=item[0];var l=item[1];var desc=item[2];var Ic=item[3];var col=item[4];
          return(
            <button key={t} onClick={function(){onSelect(t);}} style={{width:"100%",padding:"18px 20px",borderRadius:16,border:"1px solid "+col+"44",background:DS.card,cursor:"pointer",display:"flex",alignItems:"center",gap:16,textAlign:"left"}}>
              <div style={{width:48,height:48,borderRadius:14,background:col+"18",border:"1px solid "+col+"33",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ic size={24} color={col}/></div>
              <div><div style={{fontSize:15,fontWeight:800,color:DS.text,marginBottom:3}}>{l}</div><div style={{fontSize:12,color:DS.textMuted}}>{desc}</div></div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
function AuthScreen(props){
  var onAuth=props.onAuth;var onBack=props.onBack;
  var _initType=props.initialAccType||"client";
  var s1=useState("login");var mode=s1[0];var setMode=s1[1];
  var s2=useState(_initType);var accType=s2[0];var setAccType=s2[1];
  var s3=useState("");var email=s3[0];var setEmail=s3[1];
  var s4=useState("");var pass=s4[0];var setPass=s4[1];
  var s5=useState(false);var showP=s5[0];var setShowP=s5[1];
  var s8=useState(false);var cgu=s8[0];var setCgu=s8[1];
  var s10=useState(false);var loading=s10[0];var setLoading=s10[1];
  var s11=useState("");var authErr=s11[0];var setAuthErr=s11[1];
  var s12=useState("");var confirmPass=s12[0];var setConfirmPass=s12[1];
  var s13=useState(false);var emailPending=s13[0];var setEmailPending=s13[1];
  var s14=useState("");var formErr=s14[0];var setFormErr=s14[1];
  var sGLoad=useState(false);var gLoading=sGLoad[0];var setGLoading=sGLoad[1];
  function handleAuthError(e){
    var msg=e.message||"";
    if(msg.includes("fetch")||msg.includes("network")||msg.includes("ERR_")||msg.includes("Failed to fetch")){
      setAuthErr("Connexion impossible. Vérifiez votre connexion internet.");
    } else if(msg.includes("Invalid login")||msg.includes("invalid_credentials")){
      setAuthErr("Email ou mot de passe incorrect.");
    } else if(msg.includes("already registered")||msg.includes("User already registered")){
      setAuthErr("Cet email est déjà utilisé. Essayez de vous connecter.");
    } else if(msg.includes("longer than 72")||msg.includes("72 characters")){
      setAuthErr("Mot de passe trop long. Maximum 72 caractères.");
    } else if(msg.includes("Password should be")||msg.includes("password")){
      setAuthErr("Le mot de passe doit contenir entre 6 et 72 caractères.");
    } else if(msg.includes("Email not confirmed")){
      setAuthErr("Confirmez votre email avant de vous connecter. Vérifiez vos spams.");
    } else if(msg.includes("rate limit")||msg.includes("too many")){
      setAuthErr("Trop de tentatives. Attendez quelques minutes avant de réessayer.");
    } else {
      setAuthErr(msg||"Erreur de connexion. Veuillez réessayer.");
    }
  }
  async function submit(){
    setFormErr("");setAuthErr("");
    if(mode==="forgot"){
      var sb=(typeof window!=="undefined"&&window.__supabase)||null;
      if(!sb){setFormErr("Service indisponible.");return;}
      var emailRe2=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(!emailRe2.test(email.trim())){setFormErr("Adresse email invalide.");return;}
      setLoading(true);
      try{var r=await sb.auth.resetPasswordForEmail(email.trim(),{redirectTo:window.location.origin});if(r.error)throw r.error;setEmailPending(true);}
      catch(e){handleAuthError(e);}
      finally{setLoading(false);}
      return;
    }
    if(!email.trim()){setFormErr("Veuillez saisir votre email.");return;}
    var emailRe=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRe.test(email.trim())){setFormErr("Adresse email invalide.");return;}
    if(pass.length<6){setFormErr("Le mot de passe doit contenir au moins 6 caractères.");return;}
    if(pass.length>72){setFormErr("Le mot de passe est trop long (maximum 72 caracteres).");return;}
    if(mode==="register"&&pass!==confirmPass){setFormErr("Les mots de passe ne correspondent pas.");return;}
    if(mode==="register"&&!cgu){setFormErr("Veuillez accepter les conditions d'utilisation.");return;}
    setLoading(true);
    try{
      var session=mode==="register"
        ?await AuthService.register(accType,email.trim(),pass)
        :await AuthService.login(accType,email.trim(),pass);
      if(session){
        if(session.needsEmailConfirm){
          setEmailPending(true);
        } else {
          onAuth(accType,session.accountStatus,session.email,session.userId);
        }
      }
    }catch(e){handleAuthError(e);}
    finally{setLoading(false);}
  }
  async function handleGoogle(){
    setGLoading(true);setAuthErr("");
    try{
      var s=await AuthService.loginWithProvider(accType,"google");
      if(s)onAuth(accType,s.accountStatus,s.email,s.userId);
    }catch(e){
      setAuthErr("Connexion Google impossible. Vérifiez que le service est configuré.");
    }finally{setGLoading(false);}
  }
  if(emailPending){
    return(
      <div style={{minHeight:"100vh",background:DS.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,animation:"hp-fade-up 0.28s ease"}}>
        <div style={{width:"100%",maxWidth:360,textAlign:"center"}}>
          <div style={{width:72,height:72,borderRadius:"50%",background:DS.primarySoft,border:"2px solid "+DS.primary,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><Mail size={32} color={DS.primary}/></div>
          <div style={{fontSize:22,fontWeight:900,color:DS.text,marginBottom:10}}>Confirmez votre email</div>
          <div style={{fontSize:14,color:DS.textMuted,lineHeight:1.7,marginBottom:24}}>Un lien de confirmation a été envoyé à <span style={{color:DS.primary,fontWeight:700}}>{email}</span>.<br/>Cliquez sur le lien pour activer votre compte.</div>
          <div style={{background:DS.card,border:"1px solid "+DS.border,borderRadius:12,padding:"12px 16px",marginBottom:20,fontSize:12,color:DS.textMuted,textAlign:"left"}}>
            <div style={{fontWeight:700,color:DS.text,marginBottom:4}}>Vous ne trouvez pas l'email ?</div>
            <div>Vérifiez vos spams ou dossier promotions. Le lien expire dans 24h.</div>
          </div>
          <button onClick={function(){setEmailPending(false);setMode("login");setPass("");setConfirmPass("");}} style={{width:"100%",padding:"13px",background:DS.primary,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer"}}>Se connecter</button>
        </div>
      </div>
    );
  }
  return(
    <div style={{minHeight:"100vh",background:DS.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,animation:"hp-fade-up 0.28s ease"}}>
      {onBack&&<button onClick={mode==="forgot"?function(){setMode("login");}:onBack} style={{position:"absolute",top:18,left:18,background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"7px 12px",display:"flex",alignItems:"center",gap:6,cursor:"pointer",color:DS.textMuted,fontSize:12,fontWeight:700}}>
        <ArrowLeft size={14} color={DS.textMuted}/>{mode==="forgot"?"Retour":"Changer de compte"}
      </button>}
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:32,fontWeight:900,color:DS.text,letterSpacing:-1}}>HotelPlatform <span style={{color:DS.client}}>Travel</span></div>
        <div style={{fontSize:12,color:DS.textMuted,marginTop:6}}>{mode==="login"?"Connectez-vous":mode==="register"?"Créez votre compte":"Réinitialiser le mot de passe"}</div>
      </div>
      <div style={{width:"100%",maxWidth:360}}>
        {mode==="register"&&(
          <div style={{marginBottom:16}}>
            <div style={{fontSize:10,color:DS.textDim,fontWeight:800,letterSpacing:1.5,marginBottom:8,textAlign:"center"}}>TYPE DE COMPTE</div>
            <div style={{display:"flex",gap:8}}>
              {[["client","Client",User,DS.client],["hotel","Hotel",Building2,DS.hotel],["restaurant","Restaurant",Utensils,DS.restaurant]].map(function(_i){
                var t=_i[0];var l=_i[1];var Ic=_i[2];var col=_i[3];var isAct=accType===t;
                return(<button key={t} onClick={function(){setAccType(t);}} style={{flex:1,padding:"12px 4px",borderRadius:12,border:"1px solid "+(isAct?col+"66":DS.border),background:isAct?col+"18":DS.card,cursor:"pointer",textAlign:"center"}}><Ic size={20} color={isAct?col:DS.textMuted} style={{margin:"0 auto 4px",display:"block"}}/><div style={{fontSize:10,fontWeight:700,color:isAct?col:DS.textMuted}}>{l}</div></button>);
              })}
            </div>
          </div>
        )}
        <div style={{position:"relative",marginBottom:10}}>
          <Mail size={14} color={DS.textMuted} style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)"}}/> 
          <input type="text" inputMode="email" value={email} onChange={function(ev){setEmail(ev.target.value);}} onFocus={function(e){e.target.classList.add("hp-input-focus");}} onBlur={function(e){e.target.classList.remove("hp-input-focus");}} placeholder="Email ou téléphone" style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:12,padding:"13px 16px 13px 38px",fontSize:13,color:DS.text,outline:"none",boxSizing:"border-box"}}/>
        </div>
        {mode!=="forgot"&&(
          <div style={{position:"relative",marginBottom:10}}>
            <Lock size={14} color={DS.textMuted} style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)"}}/>
            <input type={showP?"text":"password"} value={pass} onChange={function(ev){setPass(ev.target.value);}} onFocus={function(e){e.target.classList.add("hp-input-focus");}} onBlur={function(e){e.target.classList.remove("hp-input-focus");}} placeholder="Mot de passe" style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:12,padding:"13px 40px 13px 38px",fontSize:13,color:DS.text,outline:"none",boxSizing:"border-box"}}/>
            <button onClick={function(){setShowP(!showP);}} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",display:"flex"}}>{showP?<Eye size={14} color={DS.textMuted}/>:<EyeOff size={14} color={DS.textMuted}/>}</button>
          </div>
        )}
        {mode==="register"&&(
          <div style={{position:"relative",marginBottom:12}}>
            <Lock size={14} color={DS.textMuted} style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)"}}/>
            <input type={showP?"text":"password"} value={confirmPass} onChange={function(ev){setConfirmPass(ev.target.value);}} placeholder="Confirmer le mot de passe" style={{width:"100%",background:DS.card,border:"1px solid "+(confirmPass&&confirmPass!==pass?DS.error:DS.border),borderRadius:12,padding:"13px 16px 13px 38px",fontSize:13,color:DS.text,outline:"none",boxSizing:"border-box"}}/>
          </div>
        )}
        {formErr&&<div style={{background:DS.errorSoft,border:"1px solid "+DS.error+"44",borderRadius:10,padding:"9px 14px",marginBottom:10,fontSize:12,color:DS.error,textAlign:"center"}}>{formErr}</div>}
        {mode==="register"&&accType!=="client"&&<div style={{background:DS.warningSoft,border:"1px solid "+DS.warning+"33",borderRadius:10,padding:"9px 14px",marginBottom:10,fontSize:11,color:DS.warning}}>Les comptes Hôtel et Restaurant sont soumis à validation avant activation.</div>}
        {mode==="register"&&(
          <div onClick={function(){setCgu(!cgu);}} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 0",cursor:"pointer",marginBottom:10}}>
            <div style={{width:20,height:20,borderRadius:6,border:"2px solid "+(cgu?DS.primary:DS.border),background:cgu?DS.primary:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
              {cgu&&<CheckCircle size={12} color="#fff"/>}
            </div>
            <span style={{fontSize:12,color:DS.textMuted,lineHeight:1.5}}>J'accepte les <span style={{color:DS.primary,fontWeight:700}}>conditions d'utilisation</span> et la <span style={{color:DS.primary,fontWeight:700}}>politique de confidentialité</span> de HotelPlatform Travel</span>
          </div>
        )}
        {authErr&&<div style={{background:DS.errorSoft,border:"1px solid "+DS.error+"44",borderRadius:10,padding:"9px 14px",marginBottom:10,fontSize:12,color:DS.error,textAlign:"center"}}>{authErr}</div>}
        <button onClick={submit} disabled={loading||(mode==="register"&&!cgu)} style={{width:"100%",padding:"13px",background:loading||(mode==="register"&&!cgu)?DS.textDim:DS.primary,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",marginBottom:12,opacity:loading||(mode==="register"&&!cgu)?.6:1}}>
          {loading?<span style={{display:"inline-block",width:14,height:14,border:"2px solid #fff",borderTopColor:"transparent",borderRadius:"50%",animation:"hp-spin 0.7s linear infinite",verticalAlign:"middle",marginRight:6}}/>:null}{mode==="login"?"Se connecter":mode==="register"?"Créer mon compte":"Envoyer le lien"}
        </button>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{flex:1,height:1,background:DS.border}}/><span style={{fontSize:11,color:DS.textDim}}>OU</span><div style={{flex:1,height:1,background:DS.border}}/>
        </div>
        <button onClick={handleGoogle} disabled={gLoading} style={{width:"100%",padding:"12px",background:DS.card,border:"1px solid "+DS.border,borderRadius:12,color:DS.text,fontSize:13,fontWeight:700,cursor:gLoading?"not-allowed":"pointer",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"center",gap:10,opacity:gLoading?.7:1}}>
          {gLoading?<span style={{display:"inline-block",width:14,height:14,border:"2px solid "+DS.text,borderTopColor:"transparent",borderRadius:"50%",animation:"hp-spin 0.7s linear infinite"}}/>:<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>}
          {gLoading?"Connexion...":"Continuer avec Google"}
        </button>
        <div style={{textAlign:"center",fontSize:13,color:DS.textMuted}}>
          {mode==="login"
            ? <span>Pas de compte ? <button onClick={function(){setMode("register");}} style={{background:"none",border:"none",color:DS.primary,fontSize:13,cursor:"pointer",fontWeight:700}}>S'inscrire</button></span>
            : <button onClick={function(){setMode("login");}} style={{background:"none",border:"none",color:DS.primary,fontSize:13,cursor:"pointer",fontWeight:700}}>Déjà un compte ? Se connecter</button>
          }
        </div>
        {mode==="login"&&<div style={{textAlign:"center",marginTop:8}}><button onClick={function(){setMode("forgot");}} style={{background:"none",border:"none",color:DS.textMuted,fontSize:12,cursor:"pointer"}}>Mot de passe oublié ?</button></div>}
      </div>
    </div>
  );
}
function AccountStatusScreen(props){
  var auth=props.auth;var onLogout=props.onLogout;
  var icon=null;var title="";var msg="";
  if(auth.accountStatus==="pending"){icon=<AlertTriangle size={48} color={DS.warning} style={{margin:"0 auto 16px",display:"block"}}/>;title="Validation en attente";msg="Votre compte est en cours de validation (48-72h).";}
  if(auth.accountStatus==="suspended"){icon=<Lock size={48} color={DS.error} style={{margin:"0 auto 16px",display:"block"}}/>;title="Compte suspendu";msg=auth.suspendReason||"Contactez le support.";}
  if(auth.accountStatus==="banned"){icon=<Shield size={48} color={DS.error} style={{margin:"0 auto 16px",display:"block"}}/>;title="Compte banni";msg=auth.banReason||"Banni définitivement.";}
  if(auth.accountStatus==="refused"){icon=<XCircle size={48} color={DS.error} style={{margin:"0 auto 16px",display:"block"}}/>;title="Demande refusee";msg="Votre demande a ete refusee.";}
  return(<div style={{minHeight:"100vh",background:DS.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}><div style={{width:"100%",maxWidth:360,textAlign:"center"}}>{icon}<div style={{fontSize:20,fontWeight:800,color:DS.text,marginBottom:8}}>{title}</div><div style={{fontSize:14,color:DS.textMuted,lineHeight:1.6,marginBottom:24}}>{msg}</div><a href="mailto:support@hotelplatform.com" style={{display:"block",padding:"12px",background:DS.primarySoft,border:"1px solid "+DS.primary+"33",borderRadius:12,color:DS.primary,fontSize:13,fontWeight:700,textDecoration:"none",textAlign:"center",marginBottom:12}}>Contacter le support</a><button onClick={onLogout} style={{padding:"12px",background:"transparent",border:"1px solid "+DS.border,borderRadius:12,color:DS.textMuted,fontSize:13,cursor:"pointer",width:"100%"}}>Se déconnecter</button></div></div>);
}

function ChangeEmailModal(props){
  var onClose=props.onClose;var accent=props.accent||DS.primary;
  var se=useState("");var email=se[0];var setEmail=se[1];
  var sl=useState(false);var loading=sl[0];var setLoading=sl[1];
  var serr=useState("");var err=serr[0];var setErr=serr[1];
  var sok=useState(false);var ok=sok[0];var setOk=sok[1];
  async function submit(){
    if(!email.trim()||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())){setErr("Adresse email invalide.");return;}
    setLoading(true);setErr("");
    try{
      var sb=(typeof window!=="undefined"&&window.__supabase)||null;
      if(sb){var r=await sb.auth.updateUser({email:email.trim()});if(r.error){setErr(r.error.message||"Erreur lors de la mise à jour.");setLoading(false);return;}}
      setOk(true);
    }catch(e){setErr("Erreur de connexion.");}
    setLoading(false);
  }
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:1300,display:"flex",alignItems:"flex-end",justifyContent:"center"}}><div style={{width:"100%",maxWidth:420,background:DS.surface,borderRadius:"22px 22px 0 0",border:"1px solid "+DS.border,padding:20,animation:"hp-slide-up 0.28s ease"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}><div style={{fontSize:15,fontWeight:800,color:DS.text}}>Changer d'email</div><button onClick={onClose} style={{background:DS.card,border:"1px solid "+DS.border,borderRadius:"50%",width:44,height:44,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={14} color={DS.textMuted}/></button></div>{ok?(<div style={{textAlign:"center",padding:"20px 0"}}><CheckCircle size={40} color={DS.success} style={{margin:"0 auto 12px",display:"block"}}/><div style={{fontSize:14,color:DS.text,fontWeight:700,marginBottom:6}}>Email mis à jour</div><div style={{fontSize:12,color:DS.textMuted,marginBottom:16}}>Un lien de confirmation a été envoyé à {email}.</div><button onClick={onClose} style={{width:"100%",padding:"11px",background:accent,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer"}}>Fermer</button></div>):(<div><div style={{marginBottom:10,position:"relative"}}><Mail size={14} color={DS.textMuted} style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)"}}/><input type="email" value={email} onChange={function(ev){setEmail(ev.target.value);}} placeholder="Nouvel'email" style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:12,padding:"13px 16px 13px 38px",fontSize:13,color:DS.text,outline:"none",boxSizing:"border-box"}}/></div>{err&&<div style={{background:DS.errorSoft,border:"1px solid "+DS.error+"44",borderRadius:10,padding:"9px 14px",marginBottom:10,fontSize:12,color:DS.error}}>{err}</div>}<div style={{display:"flex",gap:8}}><button onClick={onClose} style={{flex:1,padding:"11px",background:"transparent",border:"1px solid "+DS.border,borderRadius:12,color:DS.textMuted,fontSize:13,cursor:"pointer"}}>Annuler</button><button onClick={submit} disabled={loading||!email.trim()} style={{flex:2,padding:"11px",background:loading||!email.trim()?DS.textDim:accent,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:loading||!email.trim()?"not-allowed":"pointer",opacity:loading||!email.trim()?.6:1}}>{loading?"Mise à jour...":"Confirmer"}</button></div></div>)}</div></div>);
}

function ChangePwdModal(props){
  var onClose=props.onClose;var accent=props.accent||DS.primary;var onSuccess=props.onSuccess||null;
  var sc=useState("");var curPwd=sc[0];var setCurPwd=sc[1];
  var sp=useState("");var pwd=sp[0];var setPwd=sp[1];
  var sp2=useState("");var pwd2=sp2[0];var setPwd2=sp2[1];
  var sl=useState(false);var loading=sl[0];var setLoading=sl[1];
  var serr=useState("");var err=serr[0];var setErr=serr[1];
  var sok=useState(false);var ok=sok[0];var setOk=sok[1];
  var sv=useState(false);var show=sv[0];var setShow=sv[1];
  var svc=useState(false);var showCur=svc[0];var setShowCur=svc[1];
  var canSubmit=curPwd.length>=1&&pwd.length>=6&&pwd===pwd2;
  async function submit(){
    if(!curPwd){setErr("Veuillez saisir votre mot de passe actuel.");return;}
    if(pwd.length<6){setErr("Le nouveau mot de passe doit contenir au moins 6 caractères.");return;}
    if(pwd!==pwd2){setErr("Les nouveaux mots de passe ne correspondent pas.");return;}
    setLoading(true);setErr("");
    try{
      var sb=(typeof window!=="undefined"&&window.__supabase)||null;
      if(sb){
        var sess=await sb.auth.getSession();
        var email=sess&&sess.data&&sess.data.session?sess.data.session.user.email:"";
        if(email){
          var verif=await sb.auth.signInWithPassword({email:email,password:curPwd});
          if(verif.error){setErr("Mot de passe actuel incorrect.");setLoading(false);return;}
        }
        var r=await sb.auth.updateUser({password:pwd});
        if(r.error){setErr(r.error.message||"Erreur lors de la mise à jour.");setLoading(false);return;}
      }
      setOk(true);
      if(onSuccess)onSuccess();
    }catch(e){setErr("Erreur de connexion.");}
    setLoading(false);
  }
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:1300,display:"flex",alignItems:"flex-end",justifyContent:"center"}}><div style={{width:"100%",maxWidth:420,background:DS.surface,borderRadius:"22px 22px 0 0",border:"1px solid "+DS.border,padding:20,animation:"hp-slide-up 0.28s ease"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}><div style={{fontSize:15,fontWeight:800,color:DS.text}}>Changer de mot de passe</div><button onClick={onClose} style={{background:DS.card,border:"1px solid "+DS.border,borderRadius:"50%",width:44,height:44,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={14} color={DS.textMuted}/></button></div>{ok?(<div style={{textAlign:"center",padding:"20px 0"}}><CheckCircle size={40} color={DS.success} style={{margin:"0 auto 12px",display:"block"}}/><div style={{fontSize:14,color:DS.text,fontWeight:700,marginBottom:6}}>Mot de passe mis à jour</div><div style={{fontSize:12,color:DS.textMuted,marginBottom:16}}>Votre mot de passe a été modifié avec succès.</div><button onClick={onClose} style={{width:"100%",padding:"11px",background:accent,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer"}}>Fermer</button></div>):(<div><div style={{marginBottom:6,fontSize:11,color:DS.textMuted,paddingLeft:2}}>Mot de passe actuel</div><div style={{marginBottom:14,position:"relative"}}><Lock size={14} color={DS.textMuted} style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)"}}/><input type={showCur?"text":"password"} value={curPwd} onChange={function(ev){setCurPwd(ev.target.value);}} placeholder="Saisissez votre mot de passe actuel" style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:12,padding:"13px 40px 13px 38px",fontSize:13,color:DS.text,outline:"none",boxSizing:"border-box"}}/><button onClick={function(){setShowCur(!showCur);}} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer"}}>{showCur?<Eye size={14} color={DS.textMuted}/>:<EyeOff size={14} color={DS.textMuted}/>}</button></div><div style={{height:1,background:DS.border,marginBottom:14}}/><div style={{marginBottom:6,fontSize:11,color:DS.textMuted,paddingLeft:2}}>Nouveau mot de passe</div><div style={{marginBottom:10,position:"relative"}}><Lock size={14} color={DS.textMuted} style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)"}}/><input type={show?"text":"password"} value={pwd} onChange={function(ev){setPwd(ev.target.value);}} placeholder="Au moins 6 caractères" style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:12,padding:"13px 40px 13px 38px",fontSize:13,color:DS.text,outline:"none",boxSizing:"border-box"}}/><button onClick={function(){setShow(!show);}} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer"}}>{show?<Eye size={14} color={DS.textMuted}/>:<EyeOff size={14} color={DS.textMuted}/>}</button></div><div style={{marginBottom:14,position:"relative"}}><Lock size={14} color={DS.textMuted} style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)"}}/><input type={show?"text":"password"} value={pwd2} onChange={function(ev){setPwd2(ev.target.value);}} placeholder="Confirmer le nouveau mot de passe" style={{width:"100%",background:DS.card,border:"1px solid "+(pwd2&&pwd2!==pwd?DS.error:DS.border),borderRadius:12,padding:"13px 16px 13px 38px",fontSize:13,color:DS.text,outline:"none",boxSizing:"border-box"}}/></div>{err&&<div style={{background:DS.errorSoft,border:"1px solid "+DS.error+"44",borderRadius:10,padding:"9px 14px",marginBottom:10,fontSize:12,color:DS.error}}>{err}</div>}<div style={{display:"flex",gap:8}}><button onClick={onClose} style={{flex:1,padding:"11px",background:"transparent",border:"1px solid "+DS.border,borderRadius:12,color:DS.textMuted,fontSize:13,cursor:"pointer"}}>Annuler</button><button onClick={submit} disabled={loading||!canSubmit} style={{flex:2,padding:"11px",background:loading||!canSubmit?DS.textDim:accent,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:loading||!canSubmit?"not-allowed":"pointer",opacity:loading||!canSubmit?.6:1}}>{loading?"Vérification...":"Confirmer"}</button></div></div>)}</div></div>);
}

function NotifP(props){
  var accent=props.accent;var onBack=props.onBack;var onNavigate=props.onNavigate;var isPro=props.isPro||false;
  var extNotifs=props.notifs||null;var onMarkRead=props.onMarkRead||null;
  var _defaultNotifs=isPro
    ?[]
    :[];
  var ns=useState(_defaultNotifs);
  var _localNotifs=ns[0];var setLocalNotifs=ns[1];
  var notifs=extNotifs!==null?extNotifs:_localNotifs;
  function handleMarkRead(id){
    if(onMarkRead){onMarkRead(id);}
    else{setLocalNotifs(function(prev){return prev.map(function(x){return x.id===id?Object.assign({},x,{read:true}):x;});});}
  }
  var title=isPro?"Notifications Pro":"Notifications";
  var snSk=useState(true);var notifSkLoading=snSk[0];var setNotifSkLoading=snSk[1];
  useEffect(function(){var t=setTimeout(function(){setNotifSkLoading(false);},300);return function(){clearTimeout(t);};},[]);
  return(<div style={{background:DS.bg,minHeight:"100vh"}}><TopBar left={<BackBtn onClick={onBack}/>} center={<div style={{fontSize:15,fontWeight:800,color:DS.text}}>{title}</div>} right={null}/>{notifSkLoading?<NotifSkeleton/>:<>{notifs.length===0&&<Emp Icon={Bell} title="Aucune notification" sub="Vos notifications apparaîtront ici"/>}{notifs.map(function(n,_ni){var Icon=ICON_MAP[n.icon]||ICON_MAP[n.Icon&&n.Icon.displayName]||Bell;return(<div key={n.id} onClick={function(){handleMarkRead(n.id);if(onNavigate)onNavigate(n.tab);}} style={{display:"flex",gap:12,padding:"14px 16px",borderBottom:"1px solid "+DS.border+"20",cursor:"pointer",background:n.read?"transparent":n.color+"08",animation:"hp-item-in 0.3s ease both",animationDelay:(_ni*50)+"ms"}}><div style={{width:40,height:40,borderRadius:"50%",background:n.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon size={18} color={n.color}/></div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:n.read?600:800,color:DS.text,marginBottom:2}}>{n.title}</div><div style={{fontSize:12,color:DS.textMuted}}>{n.body}</div><div style={{fontSize:10,color:DS.textDim,marginTop:4}}>{n.time}</div></div>{!n.read&&<div style={{width:8,height:8,borderRadius:"50%",background:accent,marginTop:6,flexShrink:0}}/>}</div>);})}</>}</div>);
}

function SettingsS(props){
  var onBack=props.onBack;var accType=props.accType;var onLogout=props.onLogout;var onPremium=props.onPremium;var onPrivacy=props.onPrivacy;var onDeleteAccount=props.onDeleteAccount||null;
  var isPremium=props.isPremium||false;var premiumData=props.premiumData||null;
  var onChangeEmail=props.onChangeEmail||null;var onChangePwd=props.onChangePwd||null;
  var notifPrefs=props.notifPrefs||{reservation:true,message:true,promo:true,follow:true};
  var onUpdateNotifPrefs=props.onUpdateNotifPrefs||function(){};
  var color=rC(accType);
  var premiumExpStr=isPremium&&premiumData?new Date(premiumData.expiresAt).toLocaleDateString("fr-FR"):null;
  var sDC=useState(false);var showDelConf=sDC[0];var setShowDelConf=sDC[1];
  function accountActions(label){
    if(label==="Changer d'email"&&onChangeEmail)return onChangeEmail();
    if(label==="Changer de mot de passe"&&onChangePwd)return onChangePwd();
  }
  var NOTIF_TOGGLES=[["reservation","Réservations","Confirmations et mises à jour"],["message","Messages","Nouveaux messages reçus"],["promo","Promotions","Offres et événements"],["follow","Abonnés","Nouveaux abonnés"]];
  return(<div style={{background:DS.bg,minHeight:"100vh"}}><TopBar left={<BackBtn onClick={onBack}/>} center={<div style={{fontSize:15,fontWeight:800,color:DS.text}}>Paramètres</div>} right={null}/><div style={{padding:"8px 0 40px"}}><div style={{padding:"8px 16px",fontSize:10,fontWeight:800,color:DS.textDim,letterSpacing:1.5}}>ABONNEMENT</div><div style={{background:DS.card,borderRadius:12,margin:"0 12px 8px",border:"1px solid "+DS.border}}>{isPremium?(<div style={{padding:"12px 16px"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div><div style={{fontSize:12,fontWeight:800,color:DS.gold}}>Premium actif</div><div style={{fontSize:10,color:DS.textMuted}}>Expire le {premiumExpStr}</div></div><div style={{display:"flex",gap:6}}><VBadge sz={20}/><button onClick={onPremium} style={{padding:"5px 10px",background:DS.gold+"22",border:"1px solid "+DS.gold+"44",borderRadius:16,color:DS.gold,fontSize:10,fontWeight:800,cursor:"pointer"}}>Gerer</button></div></div></div>):(<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px"}}><div><div style={{fontSize:12,fontWeight:700,color:DS.gold}}>Passer Premium</div><div style={{fontSize:10,color:DS.textMuted}}>{accType==="client"?"Sans pub · Confidentialité · Badge éligible":"Vidéo · Badge · Avis clients"}</div></div><button onClick={onPremium} style={{padding:"6px 14px",background:DS.gold,border:"none",borderRadius:20,color:"#000",fontSize:11,fontWeight:800,cursor:"pointer"}}>Voir</button></div>)}</div><div style={{padding:"8px 16px",fontSize:10,fontWeight:800,color:DS.textDim,letterSpacing:1.5}}>COMPTE</div><div style={{background:DS.card,borderRadius:12,margin:"0 12px 8px",border:"1px solid "+DS.border}}>{[["Changer d'email",Mail],["Changer de mot de passe",Lock]].map(function(_i){var label=_i[0];var Ic=_i[1];return(<div key={label} onClick={function(){accountActions(label);}} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 16px",borderBottom:"1px solid "+DS.border+"20",cursor:"pointer"}}><div style={{width:32,height:32,borderRadius:9,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic size={15} color={color}/></div><span style={{flex:1,fontSize:13,color:DS.text}}>{label}</span><ChevronRight size={14} color={DS.textDim}/></div>);})}</div><div style={{padding:"8px 16px",fontSize:10,fontWeight:800,color:DS.textDim,letterSpacing:1.5}}>NOTIFICATIONS</div><div style={{background:DS.card,borderRadius:12,margin:"0 12px 8px",border:"1px solid "+DS.border}}>{NOTIF_TOGGLES.map(function(_i,idx){var key=_i[0];var title=_i[1];var desc=_i[2];var val=notifPrefs[key]!==false;return(<div key={key} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 16px",borderBottom:idx<NOTIF_TOGGLES.length-1?"1px solid "+DS.border+"20":"none"}}><div style={{flex:1}}><div style={{fontSize:13,color:DS.text,fontWeight:600}}>{title}</div><div style={{fontSize:10,color:DS.textMuted}}>{desc}</div></div><div onClick={function(){var patch={};patch[key]=!val;onUpdateNotifPrefs(patch);}} style={{width:40,height:22,borderRadius:11,background:val?color:DS.border,cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}><div style={{position:"absolute",top:2,left:val?20:2,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/></div></div>);})}</div><div style={{padding:"8px 16px",fontSize:10,fontWeight:800,color:DS.textDim,letterSpacing:1.5}}>CONFIDENTIALITE</div><div style={{background:DS.card,borderRadius:12,margin:"0 12px 8px",border:"1px solid "+DS.border}}><div onClick={onPrivacy} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 16px",cursor:"pointer"}}><div style={{width:32,height:32,borderRadius:9,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center"}}><Eye size={15} color={color}/></div><span style={{flex:1,fontSize:13,color:DS.text}}>Paramètres de confidentialité</span><ChevronRight size={14} color={DS.textDim}/></div></div><div style={{padding:"8px 16px",fontSize:10,fontWeight:800,color:DS.textDim,letterSpacing:1.5}}>ZONE SENSIBLE</div><div style={{background:DS.card,borderRadius:12,margin:"0 12px 8px",border:"1px solid "+DS.error+"33"}}><div onClick={function(){setShowDelConf(true);}} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 16px",cursor:"pointer"}}><div style={{width:32,height:32,borderRadius:9,background:DS.errorSoft,display:"flex",alignItems:"center",justifyContent:"center"}}><Trash2 size={15} color={DS.error}/></div><span style={{flex:1,fontSize:13,color:DS.error}}>Supprimer mon compte</span><ChevronRight size={14} color={DS.error+"88"}/></div></div><div style={{background:DS.card,borderRadius:12,margin:"0 12px 8px",border:"1px solid "+DS.border}}><div onClick={onLogout} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 16px",cursor:"pointer"}}><div style={{width:32,height:32,borderRadius:9,background:DS.error+"18",display:"flex",alignItems:"center",justifyContent:"center"}}><LogOut size={15} color={DS.error}/></div><span style={{flex:1,fontSize:13,color:DS.error}}>Se déconnecter</span></div></div></div>{showDelConf&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:1600,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={function(){setShowDelConf(false);}}><div onClick={function(e){e.stopPropagation();}} style={{width:"100%",maxWidth:420,background:DS.surface,borderRadius:"22px 22px 0 0",border:"1px solid "+DS.border,padding:24,animation:"hp-slide-up 0.28s ease"}}><div style={{textAlign:"center",marginBottom:20}}><div style={{width:56,height:56,borderRadius:"50%",background:DS.errorSoft,border:"1px solid "+DS.error+"44",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}><Trash2 size={26} color={DS.error}/></div><div style={{fontSize:16,fontWeight:900,color:DS.text,marginBottom:8}}>Supprimer mon compte</div><div style={{fontSize:12,color:DS.textMuted,lineHeight:1.7}}>Cette action est <span style={{color:DS.error,fontWeight:700}}>irréversible</span>. Toutes vos données personnelles seront supprimées conformément au RGPD dans un délai de 30 jours.</div></div><div style={{background:DS.warningSoft,border:"1px solid "+DS.warning+"33",borderRadius:10,padding:"10px 14px",marginBottom:20,fontSize:11,color:DS.warning}}>Vos réservations en cours, messages et historique seront définitivement supprimés.</div><div style={{display:"flex",gap:10}}><button onClick={function(){setShowDelConf(false);}} style={{flex:1,padding:"13px",background:"transparent",border:"1px solid "+DS.border,borderRadius:12,color:DS.textMuted,fontSize:13,fontWeight:700,cursor:"pointer"}}>Annuler</button><button onClick={function(){setShowDelConf(false);if(onDeleteAccount)onDeleteAccount();}} style={{flex:1,padding:"13px",background:DS.error,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer"}}>Confirmer</button></div></div></div>)}</div>);
}

function PremiumModal(props){
  var onClose=props.onClose;var onSubscribe=props.onSubscribe;var accType=props.accType||"client";
  var s1=useState("std");var plan=s1[0];var setPlan=s1[1];
  var s2=useState(1);var step=s2[0];var setStep=s2[1];
  var s3=useState(1);var duration=s3[0];var setDuration=s3[1];
  var sC=useState(false);var closing=sC[0];var setClosing=sC[1];
  var cT=useRef(null);
  function handleClose(){if(closing)return;setClosing(true);cT.current=setTimeout(function(){onClose();},260);}
  useEffect(function(){return function(){if(cT.current)clearTimeout(cT.current);};},[]);
  var isClient=accType==="client";
  var PLANS=isClient
    ?[{id:"std",name:"Premium Essentiel",price:9.99,color:DS.client,features:["Sans publicité","Confidentialité avancée","Verrouillage de profil","Support prioritaire"]},
      {id:"plus",name:"Premium Plus",price:19.99,color:DS.gold,features:["Tout Essentiel","Badge eligible verification","Mode pseudonyme","Statistiques profil"]}]
    :[{id:"std",name:"Premium Standard",price:9.99,color:DS.primary,features:["Publications video","Sans publicité","Éligible badge vérification","Éligible aux avis clients"]},
      {id:"plus",name:"Premium Plus",price:19.99,color:DS.gold,features:["Tout Standard","Mise en avant boostée","Visibilite prioritaire","Statistiques avancées"]},
      {id:"biz",name:"Premium Boosté Avancé",price:49.99,color:DS.hotel,features:["Tout Plus","Avantages exclusifs","Manager dédié","API access"]}];
  var sel=PLANS.find(function(p){return p.id===plan;})||PLANS[0];
  var DURATIONS=[{months:1,label:"1 mois",discount:0},{months:3,label:"3 mois",discount:0.10},{months:6,label:"6 mois",discount:0.20},{months:12,label:"12 mois",discount:0.30}];
  var selDur=DURATIONS.find(function(d){return d.months===duration;})||DURATIONS[0];
  var rawTotal=sel.price*selDur.months;
  var finalTotal=rawTotal*(1-selDur.discount);
  var savings=rawTotal-finalTotal;
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.9)",zIndex:1200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}><div style={{width:"100%",maxWidth:420,background:DS.surface,borderRadius:"22px 22px 0 0",border:"1px solid "+DS.border,maxHeight:"92vh",overflowY:"auto",WebkitOverflowScrolling:"touch",touchAction:"pan-y",animation:closing?"hp-sheet-out 0.26s ease forwards":"hp-slide-up 0.32s ease"}}><div style={{padding:"16px 20px",borderBottom:"1px solid "+DS.border,display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{fontSize:16,fontWeight:900,color:DS.gold}}>HotelPlatform Premium</div><button onClick={handleClose} style={{background:DS.card,border:"1px solid "+DS.border,borderRadius:"50%",width:44,height:44,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={14} color={DS.textMuted}/></button></div><div style={{padding:"0 20px",display:"flex",gap:4,marginTop:14}}>{[1,2,3].map(function(s){return <div key={s} style={{flex:1,height:3,borderRadius:2,background:s<=step?DS.gold:DS.border}}/>;})}</div><div style={{padding:20}}>{step===1&&<div>{PLANS.map(function(p){var isS=plan===p.id;return(<button key={p.id} onClick={function(){setPlan(p.id);}} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",marginBottom:8,borderRadius:12,border:"1.5px solid "+(isS?p.color+"88":DS.border),background:isS?p.color+"14":DS.card,cursor:"pointer",textAlign:"left"}}><div><div style={{fontSize:13,fontWeight:800,color:isS?p.color:DS.text}}>{p.name}</div><div style={{fontSize:10,color:DS.textMuted,marginTop:2}}>{p.features.slice(0,2).join(" - ")}</div></div><div style={{fontSize:16,fontWeight:900,color:p.color}}>{p.price} EUR<span style={{fontSize:9,color:DS.textMuted,fontWeight:600}}>/mois</span></div></button>);})}  <button onClick={function(){setStep(2);}} style={{width:"100%",padding:"11px",background:DS.gold,border:"none",borderRadius:12,color:"#000",fontSize:14,fontWeight:900,cursor:"pointer",marginTop:8}}>Continuer</button></div>}{step===2&&<div><div style={{fontSize:14,fontWeight:800,color:DS.text,marginBottom:4}}>Choisissez votre duree</div><div style={{fontSize:12,color:DS.textMuted,marginBottom:14}}>{sel.name} - plus la duree est longue, plus la reduction est importante</div>{DURATIONS.map(function(d){var isS=duration===d.months;var dTotal=sel.price*d.months*(1-d.discount);return(<button key={d.months} onClick={function(){setDuration(d.months);}} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",marginBottom:8,borderRadius:12,border:"1.5px solid "+(isS?DS.gold+"88":DS.border),background:isS?DS.gold+"14":DS.card,cursor:"pointer",textAlign:"left"}}><div><div style={{fontSize:13,fontWeight:800,color:isS?DS.gold:DS.text}}>{d.label}</div>{d.discount>0&&<div style={{fontSize:10,color:DS.success,marginTop:2,fontWeight:700}}>Économisez {Math.round(d.discount*100)}%</div>}</div><div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:900,color:isS?DS.gold:DS.text}}>{dTotal.toFixed(2)} EUR</div><div style={{fontSize:9,color:DS.textMuted}}>{(dTotal/d.months).toFixed(2)} EUR/mois</div></div></button>);})}<div style={{display:"flex",gap:8,marginTop:8}}><button onClick={function(){setStep(1);}} style={{flex:1,padding:"11px",background:"transparent",border:"1px solid "+DS.border,borderRadius:12,color:DS.textMuted,fontSize:13,cursor:"pointer"}}>Retour</button><button onClick={function(){setStep(3);}} style={{flex:2,padding:"11px",background:DS.gold,border:"none",borderRadius:12,color:"#000",fontSize:14,fontWeight:900,cursor:"pointer"}}>Continuer</button></div></div>}{step===3&&<div style={{textAlign:"center",paddingBottom:10}}><div style={{width:72,height:72,borderRadius:"50%",background:DS.goldSoft,border:"2px solid "+DS.gold,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><VBadge sz={40}/></div><div style={{fontSize:18,fontWeight:900,color:DS.gold,marginBottom:6}}>{sel.name}</div><div style={{fontSize:13,color:DS.textMuted,marginBottom:16}}>{selDur.label} - {finalTotal.toFixed(2)} EUR{savings>0&&<span style={{color:DS.success}}> (économie de {savings.toFixed(2)} EUR)</span>}</div><div style={{background:DS.card,border:"1px solid "+DS.border,borderRadius:12,padding:"14px 16px",marginBottom:20,textAlign:"left"}}>{sel.features.map(function(f,i){return <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:i<sel.features.length-1?8:0}}><CheckCircle size={13} color={DS.gold}/><span style={{fontSize:12,color:DS.textMuted}}>{f}</span></div>;})}</div><div style={{display:"flex",gap:8}}><button onClick={function(){setStep(2);}} style={{flex:1,padding:"11px",background:"transparent",border:"1px solid "+DS.border,borderRadius:12,color:DS.textMuted,fontSize:13,cursor:"pointer"}}>Retour</button><button onClick={function(){if(onSubscribe)onSubscribe(plan,duration);}} style={{flex:2,padding:"11px",background:DS.gold,border:"none",borderRadius:12,color:"#000",fontSize:13,fontWeight:900,cursor:"pointer"}}>Confirmer l'abonnement</button></div></div>}</div></div></div>);
}

function PrivacyModal(props){
  var onClose=props.onClose;var accType=props.accType;var isPremium=props.isPremium||false;var onPremium=props.onPremium||function(){};
  var color=rC(accType||"client");
  var isClientAcc=accType==="client";
  var sC=useState(false);var closing=sC[0];var setClosing=sC[1];
  var cT=useRef(null);
  function handleClose(){if(closing)return;setClosing(true);cT.current=setTimeout(function(){onClose();},260);}
  useEffect(function(){return function(){if(cT.current)clearTimeout(cT.current);};},[]);
  var settings=props.settings||{locked:false,pseudo:false,vis:"public",msgPermission:"everyone"};
  var onUpdate=props.onUpdate||function(){};
  var locked=settings.locked;var pseudo=settings.pseudo;var vis=settings.vis;var msgPermission=settings.msgPermission||"everyone";
  function handleToggle(setter,val){
    if(!isPremium){handleClose();setTimeout(function(){onPremium();},300);return;}
    setter(!val);
  }
  function handleVis(v){
    if(!isPremium){handleClose();setTimeout(function(){onPremium();},300);return;}
    onUpdate({vis:v});
  }
  function handleMsg(v){
    if(!isPremium){handleClose();setTimeout(function(){onPremium();},300);return;}
    onUpdate({msgPermission:v});
  }
  var LOCK_ROWS=isClientAcc?[
    ["Verrouiller mon profil","Photo floutée, galerie masquée",locked,function(v){onUpdate({locked:v});}],
    ["Mode pseudonyme","Afficher « Voyageur » à la place de votre nom",pseudo,function(v){onUpdate({pseudo:v});}]
  ]:[];
  var VIS_ROWS=[["public","Tout le monde"],["friends","Amis uniquement"],["private","Profil privé"]];
  var MSG_ROWS=[["everyone","Tout le monde"],["booked","Établissements avec qui vous avez une réservation"],["none","Personne (messages bloqués)"]];
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:1200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:420,background:DS.surface,borderRadius:"22px 22px 0 0",border:"1px solid "+DS.border,maxHeight:"88vh",overflowY:"auto",WebkitOverflowScrolling:"touch",touchAction:"pan-y",animation:closing?"hp-sheet-out 0.26s ease forwards":"hp-slide-up 0.28s ease"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid "+DS.border,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:DS.text}}>Confidentialité Premium</div>
            <div style={{fontSize:11,color:DS.textMuted}}>Contrôlez qui voit votre profil</div>
          </div>
          <button onClick={handleClose} style={{background:DS.card,border:"1px solid "+DS.border,borderRadius:"50%",width:44,height:44,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={14} color={DS.textMuted}/></button>
        </div>
        <div style={{padding:20}}>
          {!isPremium&&<div style={{background:DS.goldSoft,border:"1px solid "+DS.gold+"44",borderRadius:10,padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
            <Lock size={14} color={DS.gold}/>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:DS.gold}}>Fonctionnalité Premium</div>
              <div style={{fontSize:11,color:DS.textMuted}}>Passez Premium pour activer ces paramètres</div>
            </div>
            <button onClick={function(){handleClose();setTimeout(function(){onPremium();},300);}} style={{background:DS.gold,border:"none",borderRadius:8,padding:"5px 10px",color:"#000",fontSize:11,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap"}}>Débloquer</button>
          </div>}
          {LOCK_ROWS.map(function(row,i){var title=row[0];var desc=row[1];var val=row[2];var setter=row[3];return(
            <div key={i} style={{background:DS.card,border:"1px solid "+DS.border,borderRadius:12,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between",opacity:isPremium?1:0.55}}>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:DS.text}}>{title}</div><div style={{fontSize:11,color:DS.textMuted}}>{desc}</div></div>
              <div onClick={function(){handleToggle(setter,val);}} style={{width:44,height:24,borderRadius:12,background:val&&isPremium?color:DS.border,cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}>
                <div style={{position:"absolute",top:2,left:val&&isPremium?22:2,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
              </div>
            </div>
          );})}
          {isClientAcc&&<div style={{marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:700,color:DS.text,marginBottom:8}}>Visibilité du profil</div>
            {VIS_ROWS.map(function(row){var v=row[0];var l=row[1];var isAct=vis===v;return(
              <button key={v} onClick={function(){handleVis(v);}} style={{width:"100%",padding:"9px 12px",marginBottom:5,borderRadius:10,border:"1px solid "+(isAct?color+"66":DS.border),background:isAct?color+"14":DS.card,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:8,opacity:isPremium?1:0.55}}>
                <div style={{width:16,height:16,borderRadius:"50%",border:"2px solid "+(isAct?color:DS.border),background:isAct?color:"transparent",flexShrink:0}}/>
                <span style={{fontSize:12,color:isAct?color:DS.textMuted,fontWeight:isAct?700:400}}>{l}</span>
              </button>
            );})}
          </div>}
          {!isClientAcc&&<div style={{background:DS.primarySoft,border:"1px solid "+DS.primary+"22",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:11,color:DS.textMuted}}>Votre profil d'établissement est toujours public et visible par tous les utilisateurs de la plateforme.</div>}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:700,color:DS.text,marginBottom:2}}>Qui peut vous envoyer un message</div>
            <div style={{fontSize:11,color:DS.textMuted,marginBottom:8}}>Contrôlez quels établissements peuvent vous contacter</div>
            {MSG_ROWS.map(function(row){var v=row[0];var l=row[1];var isAct=msgPermission===v;return(
              <button key={v} onClick={function(){handleMsg(v);}} style={{width:"100%",padding:"9px 12px",marginBottom:5,borderRadius:10,border:"1px solid "+(isAct?color+"66":DS.border),background:isAct?color+"14":DS.card,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:8,opacity:isPremium?1:0.55}}>
                <div style={{width:16,height:16,borderRadius:"50%",border:"2px solid "+(isAct?color:DS.border),background:isAct?color:"transparent",flexShrink:0}}/>
                <span style={{fontSize:12,color:isAct?color:DS.textMuted,fontWeight:isAct?700:400}}>{l}</span>
              </button>
            );})}
          </div>
          <button onClick={handleClose} style={{width:"100%",padding:"11px",background:color,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer"}}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

function ChatUI(props){
  var init=props.chats;var myColor=props.myColor;var nK=props.nK;var iK=props.iK;var vK=props.vK;var qR=props.qR;var isClientChat=props.isClientChat||false;
  var myId=props.myId||null;var myName=props.myName||"";
  var initialConv=props.initialConv!==undefined&&props.initialConv!==null?props.initialConv:null;
  var s1=useState(initialConv);var active=s1[0];var setActive=s1[1];
  var s2=useState("");var msg=s2[0];var setMsg=s2[1];
  var s3=useState(null);var replyTo=s3[0];var setReplyTo=s3[1];
  var smnu=useState(null);var menuMsg=smnu[0];var setMenuMsg=smnu[1];
  var mlpTimer=useRef(null);
  var rtChan=useRef(null);
  function mlpStart(m,e){if(m.f!=="me"||m.deleted)return;mlpTimer.current=setTimeout(function(){if(e&&e.cancelable)e.preventDefault();setMenuMsg(m);},480);}
  function mlpCancel(){if(mlpTimer.current){clearTimeout(mlpTimer.current);mlpTimer.current=null;}}
  var s4=useState(myId?[]:init.map(function(c){return Object.assign({},c,{msgs:(c.messages||[]).slice()});}));
  var thr=s4[0];var setThr=s4[1];
  var sLoad=useState(!!myId);var convLoading=sLoad[0];var setConvLoading=sLoad[1];
  var sConvErr=useState("");var convErr=sConvErr[0];var setConvErr=sConvErr[1];
  // Charge la liste des conversations depuis Supabase
  useEffect(function(){
    var client=DataLayer._client;
    if(!myId||!client)return;
    var col=isClientChat?"client_id":"pro_id";
    client.from("conversations").select("*").eq(col,myId).order("updated_at",{ascending:false})
      .then(function(res){
        setConvLoading(false);
        if(res.error||!res.data||res.data.length===0){
          if(init&&init.length>0)setThr(init.map(function(c){return Object.assign({},c,{msgs:(c.messages||[]).slice()});}));
          return;
        }
        var newThr=res.data.map(function(c){
          var obj={convId:c.id,msgs:[]};
          obj[nK]=isClientChat?c.pro_name:c.client_name;
          if(iK)obj[iK]=isClientChat?c.pro_img:null;
          obj[vK]=isClientChat?(c.pro_verified||false):false;
          return obj;
        });
        setThr(newThr);
      }).catch(function(err){setConvLoading(false);if(err&&err.message!=="no-client"){setConvErr("Erreur de chargement des conversations.");}});
  },[myId,isClientChat]);
  // Charge les messages et souscrit au Realtime quand une conversation est ouverte
  var convId=active!==null&&thr[active]?thr[active].convId:null;
  useEffect(function(){
    var client=DataLayer._client;
    if(!convId||!myId||!client)return;
    client.from("messages").select("*").eq("conversation_id",convId).order("created_at",{ascending:true})
      .then(function(res){
        if(res.error||!res.data)return;
        var msgs=res.data.map(function(m){var d=new Date(m.created_at);var mn=d.getMinutes();return{id:m.id,f:m.sender_id===myId?"me":"them",t:m.deleted?"[Message supprimé]":m.body,time:d.getHours()+":"+(mn<10?"0":"")+mn,read:m.read,deleted:m.deleted,replyTo:m.reply_to_body?{t:m.reply_to_body,f:m.reply_to_sender===myId?"me":"them"}:null};});
        setThr(function(ts){return ts.map(function(c){return c.convId===convId?Object.assign({},c,{msgs:msgs}):c;});});
        client.from("messages").update({read:true}).eq("conversation_id",convId).neq("sender_id",myId).eq("read",false).then(function(){});
      });
    if(rtChan.current){try{client.removeChannel(rtChan.current);}catch(e){} rtChan.current=null;}
    var chan=client.channel("conv:"+convId)
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"messages",filter:"conversation_id=eq."+convId},function(payload){
        var m=payload.new;if(m.sender_id===myId)return;
        var d=new Date(m.created_at);var mn2=d.getMinutes();
        var nm2={id:m.id,f:"them",t:m.deleted?"[Message supprimé]":m.body,time:d.getHours()+":"+(mn2<10?"0":"")+mn2,read:false,deleted:m.deleted,replyTo:m.reply_to_body?{t:m.reply_to_body,f:"them"}:null};
        setThr(function(ts){return ts.map(function(c){return c.convId===convId?Object.assign({},c,{msgs:c.msgs.concat([nm2])}):c;});});
      }).subscribe();
    rtChan.current=chan;
    return function(){if(rtChan.current&&client){try{client.removeChannel(rtChan.current);}catch(e){}rtChan.current=null;}};
  },[convId,myId]);
  function send(){
    var sentMsg=sanitizeText(msg,2000);if(!sentMsg)return;
    var nm=MessageService.buildMessage(sentMsg,replyTo);
    var curActive=active;var curConv=thr[curActive];
    var sentReply=replyTo;
    setThr(function(ts){return ts.map(function(c,i){return i===curActive?Object.assign({},c,{msgs:c.msgs.concat([nm])}):c;});});
    setMsg("");setReplyTo(null);
    if(curConv&&curConv.convId&&myId&&DataLayer._client){
      var client=DataLayer._client;
      var convId=curConv.convId;
      // S'assurer que la conversation existe en DB avant d'insérer le message
      var _insertMsg=function(){
        client.from("messages").insert([{conversation_id:convId,sender_id:myId,sender_name:myName,body:sentMsg,reply_to_body:sentReply?sentReply.t:null,reply_to_sender:sentReply?(sentReply.f==="me"?myId:null):null,deleted:false,read:false}]).then(function(){});
        client.from("conversations").update({last_message:sentMsg,updated_at:new Date().toISOString()}).eq("id",convId).then(function(){});
      };
      // Vérifier si la conversation existe, sinon la créer
      client.from("conversations").select("id").eq("id",convId).maybeSingle().then(function(res){
        if(!res||!res.data){
          var parts=convId.split("_");
          var clientId=parts[0]||myId;var proId=parts[1]||myId;
          client.from("conversations").upsert([{id:convId,client_id:clientId,pro_id:proId,client_name:isClientChat?myName:"",pro_name:isClientChat?"":myName}],{onConflict:"id"}).then(function(){_insertMsg();}).catch(function(){_insertMsg();});
        } else { _insertMsg(); }
      }).catch(function(){ _insertMsg(); });
    }
  }
  function delMsg(id){
    setThr(function(ts){return ts.map(function(c,i){return i===active?Object.assign({},c,{msgs:c.msgs.map(function(m){return MessageService.markDeleted(m,id);})}):c;});});
    if(myId&&DataLayer._client){DataLayer._client.from("messages").update({deleted:true}).eq("id",id).eq("sender_id",myId).then(function(){});}
  }
  function markRead(idx){setThr(function(ts){return ts.map(function(c,i){return i===idx?Object.assign({},c,{msgs:c.msgs.map(function(m){return MessageService.markRead(m);})}):c;});});}
  var conv=active!==null?thr[active]:null;
  var sChatSk=useState(true);var chatSkLoading=sChatSk[0];var setChatSkLoading=sChatSk[1];
  useEffect(function(){if(active!==null)return;var t=setTimeout(function(){setChatSkLoading(false);},280);return function(){clearTimeout(t);};},[active]);
  // Compose — nouveau message
  var sCompose=useState(false);var showCompose=sCompose[0];var setShowCompose=sCompose[1];
  var sComposeQ=useState("");var composeQ=sComposeQ[0];var setComposeQ=sComposeQ[1];
  var _composeList=isClientChat
    ? DataLayer.getEstablishments().filter(function(e){return !composeQ||(e.name||"").toLowerCase().includes(composeQ.toLowerCase());})
    : (function(){var seen={};return BookingService.getAll().filter(function(r){if(!r.clientName||seen[r.clientName])return false;seen[r.clientName]=true;return !composeQ||(r.clientName||"").toLowerCase().includes(composeQ.toLowerCase());});})();
  function startConv(contact){
    var name=isClientChat?(contact.name||"Établissement"):(contact.clientName||"Client");
    var cid="conv_"+(contact.id||contact.clientName||Date.now())+"_"+(myId||"me");
    var existing=thr.findIndex(function(t){return t.convId===cid;});
    if(existing>=0){setActive(existing);setShowCompose(false);setComposeQ("");return;}
    var newC={convId:cid,msgs:[]};
    newC[nK]=name;
    if(iK)newC[iK]=isClientChat?(contact.img||null):null;
    newC[vK]=isClientChat?(contact.verified||false):false;
    setThr(function(ts){return [newC].concat(ts);});
    setActive(0);setShowCompose(false);setComposeQ("");
  }
  if(showCompose){return(<div style={{background:DS.bg,minHeight:"100%",display:"flex",flexDirection:"column"}}>
    <div style={{padding:"14px 16px",borderBottom:"1px solid "+DS.border,display:"flex",alignItems:"center",gap:10,background:DS.surface,flexShrink:0}}>
      <button onClick={function(){setShowCompose(false);setComposeQ("");}} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",padding:4}}><ArrowLeft size={20} color={DS.text}/></button>
      <div style={{fontSize:15,fontWeight:800,color:DS.text}}>Nouveau message</div>
    </div>
    <div style={{padding:"10px 16px 6px",flexShrink:0}}>
      <div style={{position:"relative"}}>
        <Search size={14} color={DS.textMuted} style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)"}}/>
        <input value={composeQ} onChange={function(e){setComposeQ(e.target.value);}} placeholder={isClientChat?"Rechercher un établissement...":"Rechercher un client..."} style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:24,padding:"10px 16px 10px 38px",fontSize:13,color:DS.text,outline:"none",boxSizing:"border-box"}}/>
      </div>
    </div>
    <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
      {_composeList.length===0&&<div style={{textAlign:"center",color:DS.textMuted,fontSize:13,padding:"40px 20px"}}>Aucun résultat</div>}
      {_composeList.map(function(c,i){
        var name=isClientChat?(c.name||"?"):(c.clientName||"Client");
        var sub=isClientChat?(c.type==="hotel"?"Hôtel":"Restaurant"):("Réservation · "+(c.service||"Séjour"));
        return(<div key={i} onClick={function(){startConv(c);}} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:"1px solid "+DS.border+"20",cursor:"pointer",animation:"hp-item-in 0.25s ease both",animationDelay:(i*40)+"ms"}}>
          <Av sz={46} letter={(name[0]||"?").toUpperCase()} img={isClientChat?(c.img||null):null} verified={isClientChat?(c.verified||false):false} isClient={!isClientChat}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:700,color:DS.text}}>{name}</div>
            <div style={{fontSize:11,color:DS.textMuted,marginTop:2}}>{sub}</div>
          </div>
          <ChevronRight size={16} color={DS.textMuted}/>
        </div>);
      })}
    </div>
  </div>);}
  if(active===null){return(<div style={{background:DS.bg,minHeight:"100%"}}><div style={{padding:"14px 16px",borderBottom:"1px solid "+DS.border,display:"flex",alignItems:"center",gap:10}}><MessageCircle size={18} color={myColor}/><div style={{fontSize:15,fontWeight:800,color:DS.text}}>Messages</div><div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:11,color:DS.textMuted}}>{thr.length} conversation{thr.length>1?"s":""}</span><button onClick={function(){setShowCompose(true);}} style={{width:32,height:32,borderRadius:"50%",background:myColor,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Plus size={16} color="#fff"/></button></div></div>{convErr&&<div style={{padding:"10px 16px",background:"#ff4d4d22",color:"#ff4d4d",fontSize:12,textAlign:"center"}}>{convErr}</div>}{(chatSkLoading||convLoading)?<ChatListSkeleton/>:(thr.length===0?<Emp Icon={MessageCircle} title="Aucun message" sub="Vos conversations apparaissent ici"/>:thr.map(function(t,i){var last=t.msgs[t.msgs.length-1];var unread=t.msgs.filter(function(m){return m.f!=="me"&&!m.read;}).length;return(<div key={i} onClick={function(){setActive(i);markRead(i);}} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:"1px solid "+DS.border+"20",cursor:"pointer",animation:"hp-item-in 0.3s ease both",animationDelay:(i*50)+"ms"}}><Av sz={46} letter={(t[nK]||"?")[0]} img={iK?t[iK]:null} verified={t[vK]||false} isClient={isClientChat}/><div style={{flex:1,minWidth:0}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><div style={{fontSize:13,fontWeight:700,color:DS.text}}>{t[nK]}</div><div style={{fontSize:10,color:DS.textMuted}}>{last?last.time:""}</div></div><div style={{fontSize:12,color:unread>0?DS.text:DS.textMuted,fontWeight:unread>0?600:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{last?last.t:"Début de la conversation"}</div></div>{unread>0&&<div style={{width:18,height:18,borderRadius:"50%",background:myColor,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",fontWeight:700,flexShrink:0}}>{unread}</div>}</div>);}))}</div>);}
  var msgs=conv?conv.msgs:[];
  return(<div style={{display:"flex",flexDirection:"column",height:"100%",background:DS.bg}}><div style={{padding:"12px 16px",borderBottom:"1px solid "+DS.border,display:"flex",alignItems:"center",gap:10,background:DS.surface,flexShrink:0}}><BackBtn onClick={function(){setActive(null);setReplyTo(null);}}/><Av sz={38} letter={(conv[nK]||"?")[0]} img={iK?conv[iK]:null} verified={conv[vK]||false} isClient={isClientChat}/><div style={{flex:1}}><div style={{fontSize:14,fontWeight:800,color:DS.text}}>{conv[nK]}</div><div style={{fontSize:10,color:DS.textMuted}}>Membre HotelPlatform</div></div></div><div style={{flex:1,minHeight:0,overflowY:"auto",WebkitOverflowScrolling:"touch",touchAction:"pan-y",padding:"12px 16px",display:"flex",flexDirection:"column",gap:6}}>{msgs.length===0&&<div style={{textAlign:"center",color:DS.textMuted,fontSize:12,marginTop:40}}>Debut de la conversation</div>}{msgs.map(function(m,i){var isMe=m.f==="me";return(<div key={m.id||i} style={{display:"flex",flexDirection:"column",alignItems:isMe?"flex-end":"flex-start",animation:"hp-msg-in 0.3s ease both",animationDelay:Math.min(i*20,200)+"ms"}}>{m.replyTo&&!m.deleted&&<div style={{padding:"4px 10px",background:DS.border,borderRadius:"8px 8px 0 0",fontSize:10,color:DS.textMuted,maxWidth:"75%",borderLeft:"3px solid "+myColor,marginBottom:-2}}><div style={{fontWeight:700,color:myColor}}>{m.replyTo.f==="me"?"Vous":conv[nK]}</div><div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.replyTo.t}</div></div>}<div onDoubleClick={function(){if(!m.deleted)setReplyTo(m);}} onTouchStart={function(e){mlpStart(m,e);}} onTouchEnd={mlpCancel} onTouchMove={mlpCancel} onMouseDown={function(){mlpStart(m);}} onMouseUp={mlpCancel} onMouseLeave={mlpCancel} onContextMenu={function(e){e.preventDefault();if(isMe&&!m.deleted)setMenuMsg(m);}} style={{padding:"9px 13px",borderRadius:isMe?"18px 18px 4px 18px":"18px 18px 18px 4px",background:m.deleted?DS.border:isMe?myColor:DS.card,color:m.deleted?DS.textDim:isMe?"#fff":DS.text,fontSize:13,maxWidth:"75%",lineHeight:1.45,cursor:"pointer",fontStyle:m.deleted?"italic":"normal",userSelect:"none",WebkitUserSelect:"none",MozUserSelect:"none",msUserSelect:"none",WebkitTouchCallout:"none"}}>{m.deleted?"[Message supprimé]":m.t}</div><div style={{display:"flex",alignItems:"center",gap:4,marginTop:2}}><span style={{fontSize:9,color:DS.textDim}}>{m.time}</span>{isMe&&!m.deleted&&<span style={{fontSize:9,color:m.read?myColor:DS.textDim}}>{m.read?"Lu":"Envoyé"}</span>}</div></div>);})} </div>{replyTo&&<div style={{padding:"6px 16px",background:DS.surface,borderTop:"1px solid "+DS.border,display:"flex",alignItems:"center",gap:8,flexShrink:0}}><div style={{flex:1,borderLeft:"3px solid "+myColor,paddingLeft:8}}><div style={{fontSize:10,color:myColor,fontWeight:700}}>Répondre</div><div style={{fontSize:11,color:DS.textMuted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{replyTo.t}</div></div><button onClick={function(){setReplyTo(null);}} style={{background:"none",border:"none",cursor:"pointer"}}><X size={14} color={DS.textMuted}/></button></div>}{qR&&msgs.length===0&&<div style={{padding:"6px 16px",display:"flex",gap:6,flexWrap:"wrap",flexShrink:0}}>{qR.map(function(q,i){return <button key={i} onClick={function(){setMsg(q);}} style={{padding:"5px 12px",borderRadius:20,border:"1px solid "+myColor+"44",background:myColor+"12",color:myColor,fontSize:11,cursor:"pointer"}}>{q}</button>;})} </div>}<div style={{padding:"10px 14px",borderTop:"1px solid "+DS.border,display:"flex",gap:8,alignItems:"center",background:DS.surface,flexShrink:0}}><input value={msg} onChange={function(e){setMsg(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter"&&!e.shiftKey)send();}} onFocus={function(e){e.target.classList.add("hp-input-focus");}} onBlur={function(e){e.target.classList.remove("hp-input-focus");}} placeholder={replyTo?"Répondre...":"Message..."} style={{flex:1,background:DS.card,border:"1px solid "+DS.border,borderRadius:22,padding:"10px 16px",fontSize:13,color:DS.text,outline:"none"}}/><button onClick={send} disabled={!msg.trim()} style={{width:40,height:40,borderRadius:"50%",background:msg.trim()?myColor:DS.border,border:"none",cursor:msg.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Send size={16} color="#fff"/></button></div>{menuMsg&&<ActionSheet label="ce message" onClose={function(){setMenuMsg(null);}} onDelete={function(){delMsg(menuMsg.id);}}/>}</div>);
}

function useLongPress(onTrigger){
  var timer=useRef(null);var fired=useRef(false);
  function start(){fired.current=false;timer.current=setTimeout(function(){fired.current=true;if(onTrigger)onTrigger();},480);}
  function cancel(){if(timer.current){clearTimeout(timer.current);timer.current=null;}}
  return {
    onTouchStart:function(){start();},
    onTouchEnd:function(){cancel();},
    onTouchMove:function(){cancel();},
    onMouseDown:function(){start();},
    onMouseUp:function(){cancel();},
    onMouseLeave:function(){cancel();},
    onContextMenu:function(e){e.preventDefault();}
  };
}
function ActionSheet(props){
  var onClose=props.onClose;var onDelete=props.onDelete;var label=props.label||"cet element";
  return(<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:1400,display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"hp-fade 0.15s ease",userSelect:"none",WebkitUserSelect:"none",WebkitTouchCallout:"none"}}>
    <div onClick={function(e){e.stopPropagation();}} style={{width:"100%",maxWidth:440,margin:"0 8px 8px",animation:"hp-slide-up 0.22s ease"}}>
      <div style={{background:DS.surface,borderRadius:16,overflow:"hidden",border:"1px solid "+DS.border,marginBottom:8}}>
        <div style={{padding:"12px 16px",textAlign:"center",fontSize:11,color:DS.textDim,borderBottom:"1px solid "+DS.border+"60"}}>Actions sur {label}</div>
        <button onClick={function(){if(onDelete)onDelete();if(onClose)onClose();}} style={{width:"100%",padding:"15px 16px",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,color:DS.error,fontSize:15,fontWeight:700}}><Trash2 size={17} color={DS.error}/>Supprimer</button>
      </div>
      <button onClick={onClose} style={{width:"100%",padding:"15px 16px",background:DS.surface,border:"1px solid "+DS.border,borderRadius:16,cursor:"pointer",color:DS.text,fontSize:15,fontWeight:800}}>Annuler</button>
    </div>
  </div>);
}
function ShareSheet(props){
  var onClose=props.onClose;var post=props.post;var onShared=props.onShared;
  var shareUrl="https://hotelplatform.travel/post/"+post.id;
  var shareText=post.author+" sur HotelPlatform Travel: "+(post.text||"");
  var full=shareText+" "+shareUrl;
  var sok=useState(false);var copied=sok[0];var setCopied=sok[1];
  function done(){if(onShared)onShared();onClose();}
  function openExt(url){
    var w=null;
    try{w=window.open(url,"_blank","noopener,noreferrer");}catch(e){w=null;}
    if(!w){
      // Ouverture bloquee (sandbox/popup): on copie le lien en repli pour ne jamais laisser l action sans effet
      fallbackCopy();
      return;
    }
    done();
  }
  function fallbackCopy(){
    try{
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(shareUrl).then(function(){setCopied(true);setTimeout(done,900);}).catch(function(){manualCopy();});}
      else{manualCopy();}
    }catch(e){manualCopy();}
  }
  function manualCopy(){
    try{var ta=document.createElement("textarea");ta.value=shareUrl;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.focus();ta.select();document.execCommand("copy");document.body.removeChild(ta);setCopied(true);setTimeout(done,900);}catch(e){setCopied(true);setTimeout(done,900);}
  }
  function nativeShare(){
    try{
      if(navigator.share){navigator.share({title:"HotelPlatform Travel",text:shareText,url:shareUrl}).then(done).catch(function(){fallbackCopy();});return;}
    }catch(e){}
    fallbackCopy();
  }
  function copyLink(){fallbackCopy();}
  var TARGETS=[
    {id:"whatsapp",name:"WhatsApp",color:"#25D366",letter:"W",url:"https://wa.me/?text="+encodeURIComponent(full)},
    {id:"facebook",name:"Facebook",color:"#1877F2",letter:"f",url:"https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(shareUrl)+"&quote="+encodeURIComponent(shareText)},
    {id:"x",name:"X",color:"#000000",letter:"X",url:"https://twitter.com/intent/tweet?text="+encodeURIComponent(shareText)+"&url="+encodeURIComponent(shareUrl)},
    {id:"telegram",name:"Telegram",color:"#0088CC",letter:"T",url:"https://t.me/share/url?url="+encodeURIComponent(shareUrl)+"&text="+encodeURIComponent(shareText)},
    {id:"messenger",name:"Messenger",color:"#0084FF",letter:"M",url:"https://www.facebook.com/dialog/send?link="+encodeURIComponent(shareUrl)+"&app_id=0&redirect_uri="+encodeURIComponent(shareUrl)},
    {id:"email",name:"Email",color:"#7A7A96",letter:"@",url:"mailto:?subject="+encodeURIComponent("HotelPlatform Travel")+"&body="+encodeURIComponent(full)}
  ];
  return(<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:1400,display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"hp-fade 0.15s ease"}}>
    <div onClick={function(e){e.stopPropagation();}} style={{width:"100%",maxWidth:440,background:DS.surface,borderRadius:"20px 20px 0 0",border:"1px solid "+DS.border,animation:"hp-slide-up 0.24s ease",paddingBottom:8}}>
      <div style={{padding:"10px 0 6px"}}><div style={{width:40,height:5,borderRadius:3,background:DS.textDim,margin:"0 auto"}}/></div>
      <div style={{padding:"4px 18px 14px",borderBottom:"1px solid "+DS.border+"40"}}>
        <div style={{fontSize:16,fontWeight:800,color:DS.text}}>Partager</div>
        <div style={{fontSize:11,color:copied?DS.success:DS.textMuted,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:copied?700:400}}>{copied?"Lien copié dans le presse-papier !":shareUrl}</div>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",padding:"16px 10px 6px"}}>
        {TARGETS.map(function(t){return(
          <button key={t.id} onClick={function(){openExt(t.url);}} style={{width:"33.33%",background:"none",border:"none",cursor:"pointer",padding:"10px 4px",display:"flex",flexDirection:"column",alignItems:"center",gap:7}}>
            <div style={{width:50,height:50,borderRadius:"50%",background:t.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:"#fff"}}>{t.letter}</div>
            <span style={{fontSize:11,color:DS.textMuted}}>{t.name}</span>
          </button>
        );})}
      </div>
      <div style={{padding:"8px 16px 4px",display:"flex",gap:8}}>
        <button onClick={nativeShare} style={{flex:1,padding:"12px",background:DS.card,border:"1px solid "+DS.border,borderRadius:12,cursor:"pointer",color:DS.text,fontSize:13,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}><Share2 size={15} color={DS.text}/>Plus</button>
        <button onClick={copyLink} style={{flex:1,padding:"12px",background:DS.card,border:"1px solid "+DS.border,borderRadius:12,cursor:"pointer",color:DS.text,fontSize:13,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}><Link2 size={15} color={DS.text}/>Copier le lien</button>
      </div>
      <button onClick={onClose} style={{width:"calc(100% - 32px)",margin:"8px 16px 4px",padding:"13px",background:"transparent",border:"1px solid "+DS.border,borderRadius:12,cursor:"pointer",color:DS.textMuted,fontSize:14,fontWeight:700}}>Annuler</button>
    </div>
  </div>);
}
function CommentsSheet(props){
  var post=props.post;var cmtText=props.cmtText;var setCmtText=props.setCmtText;var addCmt=props.addCmt;var delCmt=props.delCmt;var onClose=props.onClose;var selfLetter=props.selfLetter||"V";
  var selfName=props.selfName||"Vous";var onAddNotif=props.onAddNotif||null;var selfVerified=props.selfVerified||false;
  var sReply=useState(null);var replyTo=sReply[0];var setReplyTo=sReply[1];
  var menuC=useState(null);var menuCm=menuC[0];var setMenuCm=menuC[1];
  var sExp=useState({});var expandedReplies=sExp[0];var setExpandedReplies=sExp[1];
  var lpTimer=useRef(null);
  function lpStart(cm,e){if(cm.author!==selfName)return;lpTimer.current=setTimeout(function(){if(e&&e.cancelable)e.preventDefault();setMenuCm(cm);},480);}
  function lpCancel(){if(lpTimer.current){clearTimeout(lpTimer.current);lpTimer.current=null;}}
  // Closing animation
  var sClosing=useState(false);var closing=sClosing[0];var setClosing=sClosing[1];
  var closeTimer=useRef(null);
  function handleClose(){if(closing)return;setClosing(true);closeTimer.current=setTimeout(function(){onClose();},260);}
  useEffect(function(){return function(){if(closeTimer.current)clearTimeout(closeTimer.current);};}, []);
  // Drag handle ONLY (no list drag = no unintended movement)
  var sd=useState(0);var dragY=sd[0];var setDragY=sd[1];
  var dragging=useState(false);var isDragging=dragging[0];var setIsDragging=dragging[1];
  var st=useRef(null);var cur=useRef(0);
  function beginDrag(y){st.current=y;cur.current=0;setIsDragging(true);}
  function moveDrag(y){if(st.current===null)return;var dy=y-st.current;cur.current=dy>0?dy:0;setDragY(cur.current);}
  function endDrag(){if(cur.current>120){handleClose();return;}st.current=null;cur.current=0;setDragY(0);setIsDragging(false);}
  function onHeadTouchStart(e){beginDrag(e.touches[0].clientY);}
  function onHeadTouchMove(e){if(st.current!==null){e.preventDefault();moveDrag(e.touches[0].clientY);}}
  function onHeadTouchEnd(){if(st.current!==null)endDrag();}
  function onHeadMouseDown(e){beginDrag(e.clientY);}
  useEffect(function(){
    if(!isDragging)return;
    function mm(e){moveDrag(e.clientY);}
    function mu(){if(st.current!==null)endDrag();}
    window.addEventListener("mousemove",mm);window.addEventListener("mouseup",mu);
    return function(){window.removeEventListener("mousemove",mm);window.removeEventListener("mouseup",mu);};
  },[isDragging]);
  // Bloquer le scroll du feed derrière le sheet via le backdrop (sans toucher au body)
  function onBackdropTouch(e){if(e.target===e.currentTarget)e.preventDefault();};
  // Scroll management
  var scrollerRef=useRef(null);
  var prevCmtLen=useRef(post.comments.length);
  var initCmtCount=useRef(post.comments.length);
  // Reset scroll on first open
  useEffect(function(){if(scrollerRef.current)scrollerRef.current.scrollTop=0;},[]);
  // Scroll to bottom when new comment added
  useEffect(function(){
    if(post.comments.length>prevCmtLen.current&&scrollerRef.current){
      scrollerRef.current.scrollTop=scrollerRef.current.scrollHeight;
    }
    prevCmtLen.current=post.comments.length;
  },[post.comments.length]);
  var backdropStyle={position:"fixed",top:52,left:0,right:0,bottom:62,background:closing?"rgba(0,0,0,0)":"rgba(0,0,0,.45)",zIndex:1300,display:"flex",alignItems:"flex-end",justifyContent:"center",transition:closing?"background .26s ease":"none",maxWidth:420,marginLeft:"auto",marginRight:"auto"};
  var sheetAnim=closing?"hp-sheet-out 0.26s cubic-bezier(0.4,0,1,1) forwards":"hp-slide-up 0.32s cubic-bezier(0.22,1,0.36,1)";
  return(<div style={backdropStyle} onTouchMove={onBackdropTouch}>
    <div style={{width:"100%",maxWidth:420,height:"50vh",background:DS.surface,borderRadius:"20px 20px 0 0",border:"1px solid "+DS.border,display:"flex",flexDirection:"column",overflow:"hidden",animation:sheetAnim,transform:dragY>0?"translateY("+dragY+"px)":"none",transition:isDragging?"none":"transform 0.28s cubic-bezier(0.22,1,0.36,1)"}}>
      {/* Poignee drag */}
      <div onTouchStart={onHeadTouchStart} onTouchMove={onHeadTouchMove} onTouchEnd={onHeadTouchEnd} onMouseDown={onHeadMouseDown} style={{flexShrink:0,paddingTop:9,paddingBottom:4,cursor:"grab",userSelect:"none",touchAction:"none",textAlign:"center"}}>
        <div style={{width:40,height:4,borderRadius:2,background:DS.textDim,display:"inline-block"}}/>
      </div>
      {/* Header LinkedIn */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 16px 10px",borderBottom:"1px solid "+DS.border+"40",flexShrink:0}}>
        <div style={{fontSize:15,fontWeight:800,color:DS.text}}>Commentaires{post.comments.length>0?" ("+post.comments.length+")":""}</div>
        <button onClick={handleClose} style={{background:DS.card,border:"1px solid "+DS.border+"60",borderRadius:"50%",width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}><X size={13} color={DS.textMuted}/></button>
      </div>
      {/* Liste commentaires Facebook-style */}
      <div ref={scrollerRef} style={{flex:1,minHeight:0,overflowY:"auto",overflowX:"hidden",WebkitOverflowScrolling:"touch",touchAction:"pan-y",padding:"12px 16px",overscrollBehavior:"contain"}}>
        {post.comments.length===0&&<div style={{textAlign:"center",color:DS.textDim,fontSize:13,padding:"24px 0"}}>Aucun commentaire. Soyez le premier !</div>}
        {(function(){
          // Groupement séquentiel : chaque réponse appartient au dernier parent avant elle
          var groups=[];
          post.comments.forEach(function(cm){
            if(!cm.replyTo){
              groups.push({parent:cm,replies:[]});
            } else {
              if(groups.length>0) groups[groups.length-1].replies.push(cm);
              else groups.push({parent:cm,replies:[]});
            }
          });
          return groups.map(function(g,gi){
            var cm=g.parent;
            var mine=cm.author===selfName;
            var cmIdx=post.comments.indexOf(cm);
            var isNew=cmIdx>=initCmtCount.current;
            var repCount=g.replies.length;
            var key=cm.id||("g"+gi);
            var expanded=expandedReplies[key]||false;
            return(
              <div key={key} style={{marginBottom:16,animation:isNew?"hp-item-in 0.25s ease both":"none"}}>
                {/* Commentaire parent */}
                <div style={{display:"flex",gap:10}}>
                  <Av sz={34} letter={cm.author[0]}/>
                  <div style={{flex:1}}>
                    <div onTouchStart={function(e){lpStart(cm,e);}} onTouchEnd={lpCancel} onTouchMove={lpCancel} onMouseDown={function(){lpStart(cm);}} onMouseUp={lpCancel} onMouseLeave={lpCancel} onContextMenu={function(e){e.preventDefault();if(mine)setMenuCm(cm);}} style={{background:DS.card,borderRadius:"0 16px 16px 16px",padding:"9px 13px",cursor:mine?"pointer":"default",userSelect:"none",WebkitUserSelect:"none",MozUserSelect:"none",msUserSelect:"none",WebkitTouchCallout:"none"}}>
                      <div style={{fontSize:13,fontWeight:800,color:DS.text,marginBottom:3}}>{cm.author}</div>
                      <div style={{fontSize:13,color:DS.text,lineHeight:1.55}}>{cm.text}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginTop:4,paddingLeft:4}}>
                      <span style={{fontSize:11,color:DS.textDim,fontWeight:600}}>{cm.time}</span>
                      <button onClick={function(){setReplyTo(cm);}} style={{fontSize:12,fontWeight:700,color:DS.textMuted,background:"none",border:"none",cursor:"pointer",padding:0}}>Répondre</button>
                      {mine&&<span style={{fontSize:10,color:DS.textDim}}>· maintenir pour supprimer</span>}
                    </div>
                    {/* Bouton "Afficher X réponses" — Facebook style */}
                    {repCount>0&&!expanded&&(
                      <button onClick={function(){var n=Object.assign({},expandedReplies);n[key]=true;setExpandedReplies(n);}} style={{display:"flex",alignItems:"center",gap:6,marginTop:8,marginLeft:2,background:"none",border:"none",cursor:"pointer",padding:0}}>
                        <div style={{width:20,height:1.5,background:DS.border,borderRadius:1}}/>
                        <span style={{fontSize:12,fontWeight:700,color:DS.primary}}>Afficher {repCount} réponse{repCount>1?"s":""}</span>
                      </button>
                    )}
                    {/* Réponses expandées */}
                    {expanded&&(
                      <div style={{marginTop:10}}>
                        <button onClick={function(){var n=Object.assign({},expandedReplies);n[key]=false;setExpandedReplies(n);}} style={{display:"flex",alignItems:"center",gap:6,marginBottom:10,marginLeft:2,background:"none",border:"none",cursor:"pointer",padding:0}}>
                          <div style={{width:20,height:1.5,background:DS.border,borderRadius:1}}/>
                          <span style={{fontSize:12,fontWeight:700,color:DS.textMuted}}>Masquer les réponses</span>
                        </button>
                        {g.replies.map(function(rep,ri){
                          var repMine=rep.author===selfName;
                          var repIsNew=post.comments.indexOf(rep)>=initCmtCount.current;
                          return(
                            <div key={rep.id||("r"+gi+ri)} style={{display:"flex",gap:8,marginBottom:10,paddingLeft:4,animation:repIsNew?"hp-item-in 0.25s ease both":"none"}}>
                              <Av sz={28} letter={rep.author[0]}/>
                              <div style={{flex:1}}>
                                <div onTouchStart={function(e){lpStart(rep,e);}} onTouchEnd={lpCancel} onTouchMove={lpCancel} onMouseDown={function(){lpStart(rep);}} onMouseUp={lpCancel} onMouseLeave={lpCancel} onContextMenu={function(e){e.preventDefault();if(repMine)setMenuCm(rep);}} style={{background:DS.card,borderRadius:"0 14px 14px 14px",padding:"8px 12px",cursor:repMine?"pointer":"default",userSelect:"none",WebkitUserSelect:"none",WebkitTouchCallout:"none"}}>
                                  <div style={{fontSize:12,fontWeight:800,color:DS.text,marginBottom:3}}>{rep.author}</div>
                                  <div style={{fontSize:13,color:DS.text,lineHeight:1.55}}>{rep.text}</div>
                                </div>
                                <div style={{display:"flex",alignItems:"center",gap:12,marginTop:3,paddingLeft:3}}>
                                  <span style={{fontSize:11,color:DS.textDim,fontWeight:600}}>{rep.time}</span>
                                  <button onClick={function(){setReplyTo(cm);}} style={{fontSize:12,fontWeight:700,color:DS.textMuted,background:"none",border:"none",cursor:"pointer",padding:0}}>Répondre</button>
                                  {repMine&&<span style={{fontSize:10,color:DS.textDim}}>· maintenir pour supprimer</span>}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          });
        })()}
      </div>
      {/* Indicateur de réponse */}
      {replyTo&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 14px",background:DS.primary+"12",borderTop:"1px solid "+DS.primary+"30",flexShrink:0}}>
        <div style={{flex:1,fontSize:11,color:DS.primary,fontWeight:700}}>↩ En réponse à {replyTo.author}</div>
        <button onClick={function(){setReplyTo(null);}} style={{background:"none",border:"none",cursor:"pointer",padding:0}}><X size={13} color={DS.primary}/></button>
      </div>}
      {/* Input */}
      <div style={{display:"flex",gap:8,alignItems:"center",padding:"10px 14px",borderTop:"1px solid "+DS.border+"40",flexShrink:0,background:DS.surface}}>
        <Av sz={30} letter={selfLetter} verified={selfVerified} isClient={true}/>
        <div style={{flex:1,position:"relative"}}>
          <input value={cmtText[post.id]||""} onChange={function(e){var nc=Object.assign({},cmtText);nc[post.id]=e.target.value;setCmtText(nc);}} onKeyDown={function(e){if(e.key==="Enter"){addCmt(post.id,replyTo);if(replyTo&&replyTo.author!==selfName&&onAddNotif)onAddNotif({id:"notif_reply_"+Date.now(),icon:"MessageCircle",color:DS.primary,title:"Nouvelle réponse",body:selfName+" a répondu à votre commentaire.",time:"maintenant",read:false,tab:"feed",prefKey:"message"});setReplyTo(null);}}} onFocus={function(e){e.target.classList.add("hp-input-focus");}} onBlur={function(e){e.target.classList.remove("hp-input-focus");}} placeholder={replyTo?"Répondre à "+replyTo.author+"...":"Ajouter un commentaire..."} style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:24,padding:"10px 46px 10px 16px",fontSize:13,color:DS.text,outline:"none",boxSizing:"border-box"}}/>
          <button onClick={function(){addCmt(post.id,replyTo);if(replyTo&&replyTo.author!==selfName&&onAddNotif)onAddNotif({id:"notif_reply_"+Date.now(),icon:"MessageCircle",color:DS.primary,title:"Nouvelle réponse",body:selfName+" a répondu à votre commentaire.",time:"maintenant",read:false,tab:"feed",prefKey:"message"});setReplyTo(null);}} style={{position:"absolute",right:5,top:"50%",transform:"translateY(-50%)",background:DS.primary,border:"none",borderRadius:"50%",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><Send size={13} color="#fff"/></button>
        </div>
      </div>
    </div>
    {menuCm&&<ActionSheet label="ce commentaire" onClose={function(){setMenuCm(null);}} onDelete={function(){if(delCmt)delCmt(post.id,menuCm.id);}}/>}
  </div>);
}

function FeedText(props){
  var text=props.text||"";
  var sExp=useState(false);var exp=sExp[0];var setExp=sExp[1];
  var LIMIT=180;
  var isLong=text.length>LIMIT;
  var shown=exp||!isLong?text:text.slice(0,LIMIT).trimEnd();
  return(
    <div style={{padding:"0 16px 12px",fontSize:15,color:DS.text,lineHeight:1.65}}>
      {shown}{!exp&&isLong&&<span>… <span onClick={function(){setExp(true);}} style={{color:DS.textMuted,fontWeight:700,cursor:"pointer",fontSize:13}}>Voir plus</span></span>}
    </div>
  );
}
function ClientFeed(props){
  var onProfile=props.onProfile;var onAddNotif=props.onAddNotif||null;
  var selfEmail=props.selfEmail||"";
  var selfUserId=props.selfUserId||null;
  var isPremium=props.isPremium||false;
  var selfName=props.selfName||(function(){try{return localStorage.getItem("hp_client_display_name")||"";}catch(e){return "";}}())||(selfEmail?selfEmail.split("@")[0]:"Vous");
  var selfLetter=(selfName[0]||"V").toUpperCase();
  var _init=useRef(null);
  if(!_init.current){var _lk={};var _fv=[];try{_lk=JSON.parse(localStorage.getItem("hp_likes")||"{}");_fv=JSON.parse(localStorage.getItem("hp_favs")||"[]");}catch(e){}_init.current={likes:_lk,favs:_fv};}
  var _initLikes=_init.current.likes;var _initFavs=_init.current.favs;
  var s1=useState(function(){
    var base=DataLayer.getFeed().map(function(p){return Object.assign({},p,{liked:!!_initLikes[p.id],likes:p.likes+(_initLikes[p.id]?1:0),comments:[],showCmt:false});});
    try{var _pp=JSON.parse(localStorage.getItem("hp_pro_posts")||"[]");if(_pp.length){var _ids=base.map(function(x){return x.id;});var _new=_pp.filter(function(p){return _ids.indexOf(p.id)<0;}).map(function(p){return Object.assign({},p,{liked:false,comments:p.comments||[],showCmt:false});});base=_new.concat(base);}}catch(_e){}
    base.sort(function(a,b){var aB=(a.verified&&a.isPremium)?1:a.verified?1:0;var bB=(b.verified&&b.isPremium)?1:b.verified?1:0;return bB-aB;});
    return base;
  });
  var posts=s1[0];var setPosts=s1[1];
  var sShare=useState(null);var sharePost=sShare[0];var setSharePost=sShare[1];
  var s2=useState({});var cmtText=s2[0];var setCmtText=s2[1];
  var tk=useToast();var toast=tk.show;var Toast=tk.Toast;
  var sm=useState(null);var menuOpen=sm[0];var setMenuOpen=sm[1];
  var sf=useState(_initFavs);var favPosts=sf[0];var setFavPosts=sf[1];
  var sr=useState(null);var reportTarget=sr[0];var setReportTarget=sr[1];
  var followingPosts=props.followingIds||[];
  function toggleFav(id){
    var wasFav=favPosts.indexOf(id)>=0;
    setFavPosts(function(f){
      var next=wasFav?f.filter(function(x){return x!==id;}):f.concat([id]);
      try{localStorage.setItem("hp_favs",JSON.stringify(next));}catch(e){}
      return next;
    });
    setMenuOpen(null);
    toast(wasFav?"Retiré des favoris":"Ajouté aux favoris","success");
  }
  function openReport(post){setMenuOpen(null);setReportTarget(post);}
  function toggleFollowPost(id){if(props.onToggleFollow)props.onToggleFollow(id);}
  function toggleLike(id){
    var post=posts.find(function(p){return p.id===id;});
    var wasLiked=post?post.liked:false;
    setPosts(function(ps){
      var next=ps.map(function(p){return p.id===id?Object.assign({},p,{liked:!p.liked,likes:p.liked?p.likes-1:p.likes+1}):p;});
      try{var lk={};next.forEach(function(p){if(p.liked)lk[p.id]=1;});localStorage.setItem("hp_likes",JSON.stringify(lk));}catch(e){}
      return next;
    });
    try{
      if(DataLayer._client&&selfUserId){
        if(!wasLiked){DataLayer._client.from("post_likes").insert([{user_id:selfUserId,post_id:id}]).then(function(){}).catch(function(){});}
        else{DataLayer._client.from("post_likes").delete().eq("post_id",id).eq("user_id",selfUserId).then(function(){}).catch(function(){});}
      }
    }catch(e){}
    if(!wasLiked&&post&&onAddNotif){onAddNotif({id:"notif_like_"+id+"_"+Date.now(),icon:"Heart",color:DS.error,title:"Nouveau like",body:selfName+" a aimé la publication de "+post.author+".",time:"maintenant",read:false,tab:"feed",prefKey:"follow"});}
  }
  function toggleCmt(id){setPosts(function(ps){return ps.map(function(p){return p.id===id?Object.assign({},p,{showCmt:!p.showCmt}):p;});});}
  function doShare(id){var p=null;for(var k=0;k<posts.length;k++){if(posts[k].id===id){p=posts[k];break;}}setSharePost(p);}
  function confirmShare(id){setPosts(function(ps){return ps.map(function(p){return p.id===id?Object.assign({},p,{shares:(p.shares||0)+1}):p;});});toast("Partagé avec succès","success");}
  function addCmt(id,replyTo){
    var text=sanitizeText(cmtText[id]||"",500);if(!text)return;
    var cm={id:Date.now(),author:selfName,text:text,time:"maintenant",replyTo:replyTo?("@"+replyTo.author+" : "+replyTo.text.slice(0,40)+(replyTo.text.length>40?"…":"")):null};
    setPosts(function(ps){return ps.map(function(p){return p.id===id?Object.assign({},p,{comments:p.comments.concat([cm])}):p;});});
    var nc=Object.assign({},cmtText);nc[id]="";setCmtText(nc);
    try{if(DataLayer._client&&selfUserId){DataLayer._client.from("post_comments").insert([{post_id:id,user_id:selfUserId,author:selfName,body:text}]).then(function(){}).catch(function(){});}}catch(e){}
    toast("Commentaire publié","neutral");
  }
  function delCmt(postId,cmId){
    setPosts(function(ps){return ps.map(function(p){return p.id===postId?Object.assign({},p,{comments:p.comments.filter(function(cm){return cm.id!==cmId;})}):p;});});
    try{if(DataLayer._client)DataLayer._client.from("post_comments").delete().eq("id",String(cmId)).then(function(){}).catch(function(){});}catch(e){}
    toast("Commentaire supprimé","neutral");
  }
  var sLoad=useState(true);var loading=sLoad[0];var setLoading=sLoad[1];
  useEffect(function(){var t=setTimeout(function(){setLoading(false);},800);return function(){clearTimeout(t);};},[]);
  var sHeart=useState(null);var heartAnim=sHeart[0];var setHeartAnim=sHeart[1];
  function triggerHeart(id){setHeartAnim(id);setTimeout(function(){setHeartAnim(null);},500);}
  var _estabMap=useRef(null);
  if(!_estabMap.current){var _em={};DataLayer.getHotels().concat(DataLayer.getRestaurants()).forEach(function(e){_em[e.id]=e;});_estabMap.current=_em;}
  var postRefs=useRef({});
  function openCmt(id){
    var el=postRefs.current[id];
    if(el){
      var rect=el.getBoundingClientRect();
      var viewH=window.innerHeight;
      // Si la publication n'est pas dans la zone visible propre (entre 60px et 45% de l'écran)
      if(rect.top<60||rect.top>viewH*0.42){
        el.scrollIntoView({behavior:"smooth",block:"start"});
        setTimeout(function(){toggleCmt(id);},350);
        return;
      }
    }
    toggleCmt(id);
  }
  return(
    <div style={{background:DS.bg,paddingBottom:24,WebkitOverflowScrolling:"touch"}}>
      <Toast/>
      {loading&&<FeedSkeleton/>}
      {reportTarget&&<ReportM targetName={"la publication de "+reportTarget.author} targetId={reportTarget.id} reporterId={selfUserId} onClose={function(){setReportTarget(null);}} onSubmit={function(){setReportTarget(null);toast("Signalement envoyé · Merci pour votre contribution","success");}}/>}
      {menuOpen&&<div onClick={function(){setMenuOpen(null);}} style={{position:"fixed",inset:0,zIndex:199}}/>}
      {posts.length===0&&<Emp Icon={Home} title="Aucune publication" sub="Les publications des établissements apparaîtront ici"/>}
      {posts.map(function(post,_pi){
        var color=rC(post.type);
        return(
          <div key={post.id} ref={function(el){postRefs.current[post.id]=el;}} style={{background:DS.surface,marginBottom:8,borderTop:"1px solid "+DS.border+"22",borderBottom:"1px solid "+DS.border+"22",animation:"hp-item-in 0.38s cubic-bezier(0.22,1,0.36,1) both",animationDelay:(_pi*45)+"ms"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12,padding:"14px 16px 10px"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12,flex:1,minWidth:0}}>
                <div onClick={function(){if(onProfile)onProfile(post.id,post.type);}} style={{cursor:"pointer",flexShrink:0}}>
                  <Av sz={52} letter={post.author[0]} img={_estabMap.current[post.id]?_estabMap.current[post.id].img:null} verified={post.verified}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div onClick={function(){if(onProfile)onProfile(post.id,post.type);}} style={{fontSize:15,fontWeight:800,color:DS.text,lineHeight:1.3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",cursor:"pointer",display:"inline-block",maxWidth:"100%"}}>{post.author}</div>
                  <div style={{display:"flex",flexWrap:"nowrap",alignItems:"center",gap:5,marginTop:2,overflow:"hidden"}}>
                    <span style={{fontSize:12,color:color,fontWeight:700,flexShrink:0,whiteSpace:"nowrap"}}>{post.type==="hotel"?"Hôtel":"Restaurant"}</span>
                    {post.combined&&<span style={{fontSize:9,color:DS.primary,fontWeight:800,background:DS.primarySoft,borderRadius:8,padding:"1px 6px",flexShrink:0,whiteSpace:"nowrap"}}>+ Restaurant</span>}
                    <span style={{fontSize:12,color:DS.textMuted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0}}>{post.followers?"- "+fmtK(post.followers)+" abonnés":""}</span>
                    <span onClick={function(ev){ev.stopPropagation();toggleFollowPost(post.id);}} style={{fontSize:12,fontWeight:800,color:followingPosts.indexOf(post.id)>=0?DS.textMuted:color,cursor:"pointer",flexShrink:0,whiteSpace:"nowrap"}}>- {followingPosts.indexOf(post.id)>=0?"Suivi":"Suivre"}</span>
                  </div>
                  <div style={{fontSize:11,color:DS.textDim,marginTop:3}}>{post.time}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                <div style={{position:"relative"}}>
                  <button onClick={function(ev){ev.stopPropagation();setMenuOpen(menuOpen===post.id?null:post.id);}} style={{background:"none",border:"none",cursor:"pointer",padding:"4px 6px",borderRadius:8,display:"flex",alignItems:"center"}}><MoreVertical size={18} color={DS.textMuted}/></button>
                  {menuOpen===post.id&&(
                    <div style={{position:"absolute",top:"100%",right:0,background:DS.card,border:"1px solid "+DS.border,borderRadius:12,padding:"6px 0",minWidth:160,zIndex:200,boxShadow:"0 8px 24px rgba(0,0,0,.4)"}}>
                      <button onClick={function(){toggleFav(post.id);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",cursor:"pointer",textAlign:"left",fontSize:13,color:DS.text,display:"flex",alignItems:"center",gap:8}}>
                        <Bookmark size={14} color={favPosts.indexOf(post.id)>=0?DS.gold:DS.textMuted} fill={favPosts.indexOf(post.id)>=0?DS.gold:"none"}/>
                        {favPosts.indexOf(post.id)>=0?"Retirer des favoris":"Ajouter aux favoris"}
                      </button>
                      <button onClick={function(){openReport(post);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",cursor:"pointer",textAlign:"left",fontSize:13,color:DS.error,display:"flex",alignItems:"center",gap:8}}>
                        <Flag size={14} color={DS.error}/>Signaler ce contenu
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <FeedText text={post.text}/>
            {post.img&&<div style={{position:"relative",overflow:"hidden",background:DS.card}}><img src={post.img} alt="" className="hp-img" onLoad={function(e){e.target.classList.add("hp-img-loaded");}} onError={function(e){e.target.src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect fill='%2317171F' width='100%25' height='100%25'/%3E%3C/svg%3E";e.target.style.opacity="0.3";}} style={{width:"100%",height:"min(500px,62vh)",objectFit:"cover",display:"block"}}/></div>}
            <div style={{display:"flex",justifyContent:"space-between",padding:"10px 16px 2px",fontSize:12,color:DS.textDim}}>
              <span>{post.likes} réaction{post.likes!==1?"s":""}</span>
              <span style={{cursor:"pointer"}} onClick={function(){openCmt(post.id);}}>{post.comments.length} commentaire{post.comments.length!==1?"s":""}</span><span>{post.shares||0} partage{(post.shares||0)!==1?"s":""}</span>
            </div>
            <div style={{display:"flex",borderTop:"1px solid "+DS.border+"28",marginTop:6}}>
              {[["Liker",Heart,post.liked?DS.error:DS.textMuted,function(){toggleLike(post.id);triggerHeart(post.id);}],["Commenter",MessageCircle,DS.textMuted,function(){openCmt(post.id);}],["Partager",Share2,DS.textMuted,function(){doShare(post.id);}]].map(function(_i){
                var lb=_i[0];var Icon=_i[1];var col=_i[2];var fn=_i[3];
                return(
                  <button key={lb} onClick={fn} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"11px 0",background:"none",border:"none",cursor:"pointer",color:col,fontSize:13,fontWeight:lb==="Liker"&&post.liked?700:500}}>
                    <Icon size={19} fill={lb==="Liker"&&post.liked?DS.error:"none"} color={col} style={lb==="Liker"&&heartAnim===post.id?{animation:"hp-heart-pop .5s cubic-bezier(0.22,1,0.36,1)"}:{}}/>{lb}
                  </button>
                );
              })}
            </div>
            {post.showCmt&&(
              <CommentsSheet post={post} cmtText={cmtText} setCmtText={setCmtText} addCmt={addCmt} delCmt={delCmt} selfName={selfName} selfLetter={selfLetter} selfVerified={isPremium} onAddNotif={onAddNotif} onClose={function(){toggleCmt(post.id);}}/>
            )}
          </div>
        );
      })}
    {sharePost&&<ShareSheet post={sharePost} onClose={function(){setSharePost(null);}} onShared={function(){confirmShare(sharePost.id);}}/>}
    </div>
  );
}
function ClientDisc(props){
  var onProfile=props.onProfile;var onBook=props.onBook;
  var s1=useState("hotels");var tab=s1[0];var setTab=s1[1];
  var s2=useState("");var search=s2[0];var setSearch=s2[1];
  var sDSk=useState(true);var discSkLoading=sDSk[0];var setDiscSkLoading=sDSk[1];
  useEffect(function(){var t=setTimeout(function(){setDiscSkLoading(false);},800);return function(){clearTimeout(t);};},[]);
  var items=(function(){
    var _base=tab==="hotels"?DataLayer.getHotels():DataLayer.getRestaurants();
    var _h0=DataLayer.getHotels()[0];var _r0=DataLayer.getRestaurants()[0];
    return _base.map(function(item){
      try{
        if(tab==="hotels"&&_h0&&item.id===_h0.id){var _rr=localStorage.getItem("hp_hotelsvc_rooms");if(_rr){var _av=JSON.parse(_rr).filter(function(r){return r.available&&r.price>0;});if(_av.length){var _mn=Math.min.apply(null,_av.map(function(r){return r.price;}));if(_mn>0)return Object.assign({},item,{priceFrom:_mn});}}}
        else if(tab==="restaurants"&&_r0&&item.id===_r0.id){var _ri=localStorage.getItem("hp_restoff_items");if(_ri){var _av2=JSON.parse(_ri).filter(function(d){return d.available&&d.price>0;});if(_av2.length){var _mn2=Math.min.apply(null,_av2.map(function(d){return d.price;}));if(_mn2>0)return Object.assign({},item,{priceFrom:_mn2});}}}
      }catch(_e){}
      return item;
    });
  })();
  var filtered=items.filter(function(i){return i.name.toLowerCase().indexOf(search.toLowerCase())>=0||i.location.toLowerCase().indexOf(search.toLowerCase())>=0;});
  var color=tab==="hotels"?DS.hotel:DS.restaurant;
  return(<div style={{background:DS.bg}}><div style={{padding:"10px 14px",background:DS.surface,borderBottom:"1px solid "+DS.border}}><div style={{display:"flex",alignItems:"center",gap:8,background:DS.card,borderRadius:12,padding:"9px 14px",border:"1px solid "+DS.border}}><Search size={14} color={DS.textMuted}/><input value={search} onChange={function(e){setSearch(e.target.value);}} onFocus={function(e){e.target.classList.add("hp-input-focus");}} onBlur={function(e){e.target.classList.remove("hp-input-focus");}} placeholder="Rechercher..." style={{flex:1,background:"none",border:"none",outline:"none",color:DS.text,fontSize:13}}/></div></div><div style={{display:"flex",padding:"10px 14px",gap:8}}>{[["hotels","Hotels",Building2,DS.hotel],["restaurants","Restaurants",Utensils,DS.restaurant]].map(function(_i){var t=_i[0];var l=_i[1];var Ic=_i[2];var col=_i[3];var isAct=tab===t;return <button key={t} onClick={function(){setTab(t);}} style={{flex:1,padding:"8px",borderRadius:12,border:"1px solid "+(isAct?col:DS.border),background:isAct?col+"18":"transparent",color:isAct?col:DS.textMuted,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Ic size={14}/>{l}</button>;})} </div><div style={{padding:"0 14px",paddingBottom:16}}>{discSkLoading?<DiscSkeleton/>:(filtered.length===0?<Emp Icon={Search} title="Aucun résultat"/>:filtered.map(function(item,_idx){return(<div key={item.id} className="hp-card" style={{marginBottom:12,background:DS.card,borderRadius:16,overflow:"hidden",border:"1px solid "+DS.border,animation:"hp-item-in 0.32s ease both",animationDelay:(_idx*60)+"ms"}}><div onClick={function(){if(onProfile)onProfile(item.id,item.type);}} style={{cursor:"pointer"}}><div style={{position:"relative",height:160}}><img src={item.img} alt="" className="hp-img" onLoad={function(e){e.target.classList.add("hp-img-loaded");}} style={{width:"100%",height:"100%",objectFit:"cover"}}/>{item.svcMode==="combined"&&<div style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,.65)",borderRadius:20,padding:"4px 10px",display:"flex",alignItems:"center",gap:4}}><Utensils size={10} color="#fff"/><span style={{fontSize:9,color:"#fff",fontWeight:800}}>Hotel + Restaurant</span></div>}</div><div style={{padding:"12px 14px 0"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}><div><div style={{display:"flex",alignItems:"center",gap:5}}><div style={{fontSize:15,fontWeight:800,color:DS.text}}>{item.name}</div>{item.verified&&<VBadge sz={16}/>}</div><div style={{fontSize:11,color:DS.textMuted}}>{item.location}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:900,color:DS.gold}}>{item.priceFrom} EUR</div><div style={{fontSize:9,color:DS.textMuted}}>a partir de</div></div></div><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}><Stars r={item.rating} sz={12}/><span style={{fontSize:11,color:DS.textMuted}}>({item.reviewCount} avis)</span></div></div></div><div style={{padding:"8px 14px 14px",display:"flex",gap:8}}><button onClick={function(){if(onProfile)onProfile(item.id,item.type);}} style={{flex:1,padding:"8px",background:DS.surface,border:"1px solid "+DS.border,borderRadius:10,color:DS.textMuted,fontSize:12,cursor:"pointer"}}>Voir profil</button><button onClick={function(){if(item.svcMode==="combined"){if(onProfile)onProfile(item.id,item.type);}else{if(onBook)onBook(item);}}} style={{flex:1,padding:"8px",background:color,border:"none",borderRadius:10,color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer"}}><Calendar size={12} style={{display:"inline",marginRight:4}}/>{item.svcMode==="combined"?"Voir options":"Reserver"}</button></div></div>);}))}</div></div>);
}

function ClientProf(props){
  var onSettings=props.onSettings;var onPremium=props.onPremium;var isPremium=props.isPremium||false;var onPrivacy=props.onPrivacy;var resaHistory=props.resaHistory||[];var premiumData=props.premiumData||null;var onRenewPremium=props.onRenewPremium;var followingCount=props.followingCount||0;var profilePhoto=props.profilePhoto||null;var onPhotoChange=props.onPhotoChange||null;var onNameChange=props.onNameChange||null;
  var privacySettings=props.privacySettings||{locked:false,pseudo:false,vis:"public",msgPermission:"everyone"};
  var selfEmail=props.selfEmail||"";
  var _authUidC=props.authUserId||null;
  var _sClientName=useState(function(){try{return localStorage.getItem("hp_client_display_name")||"";}catch(e){return "";}});
  var _clientDisplayName=_sClientName[0];var _setClientDisplayName=_sClientName[1];
  var _rawName=_clientDisplayName||(selfEmail?selfEmail.split("@")[0]:"Mon profil");
  var displayName=privacySettings.pseudo?"Voyageur":_rawName;
  var _sShowEditClient=useState(false);var _showEditClient=_sShowEditClient[0];var _setShowEditClient=_sShowEditClient[1];
  var _sDraftClientName=useState(_rawName);var _draftClientName=_sDraftClientName[0];var _setDraftClientName=_sDraftClientName[1];
  var _sClientSaving=useState(false);var _clientSaving=_sClientSaving[0];var _setClientSaving=_sClientSaving[1];
  function _saveClientProfile(){
    var nm=_draftClientName.trim();if(!nm)return;
    _setClientSaving(true);
    var _done=function(){
      _setClientDisplayName(nm);
      try{localStorage.setItem("hp_client_display_name",nm);}catch(e){}
      if(onNameChange)onNameChange(nm);
      _setClientSaving(false);_setShowEditClient(false);
    };
    if(DataLayer._client&&_authUidC){DataLayer._client.from("profiles").update({display_name:nm}).eq("user_id",_authUidC).then(_done).catch(_done);}
    else{_done();}
  }
  var displayLetter=(displayName[0]||"M").toUpperCase();
  var _visLabels={public:"Profil public","friends":"Amis uniquement","private":"Profil privé"};
  var _visColors={public:DS.success,"friends":DS.warning,"private":DS.error};
  var _allEstabs=DataLayer.getHotels().concat(DataLayer.getRestaurants());
  var favEstabIds=props.favEstabIds||[];
  var favEstabs=favEstabIds.map(function(id){return _allEstabs.find(function(x){return x.id===id;});}).filter(Boolean);
  var s1=useState("reservations");var tab=s1[0];var setTab=s1[1];
  var sq=useState(null);var activeQR=sq[0];var setActiveQR=sq[1];
  var sPSk=useState(true);var profSkLoading=sPSk[0];var setProfSkLoading=sPSk[1];
  useEffect(function(){var t=setTimeout(function(){setProfSkLoading(false);},350);return function(){clearTimeout(t);};},[]);

  var _locked=privacySettings.locked||false;
  var _uploadRef=useRef(null);
  var _sViewer=useState(null);var _viewer=_sViewer[0];var _setViewer=_sViewer[1];
  var _sCPMenu=useState(false);var _cpMenu=_sCPMenu[0];var _setCPMenu=_sCPMenu[1];
  var _sCPPend=useState(null);var _cpPend=_sCPPend[0];var _setCPPend=_sCPPend[1];
  function _handlePhotoFile(e){var f=e.target.files&&e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(ev){_setCPPend(ev.target.result);};r.readAsDataURL(f);e.target.value="";}
  function _saveClientPhoto(){if(!_cpPend)return;if(onPhotoChange)onPhotoChange(_cpPend);_setCPPend(null);_setCPMenu(false);}
  function _deleteClientPhoto(){if(onPhotoChange)onPhotoChange(null);_setCPMenu(false);}
  if(profSkLoading)return <ProfSkeleton/>;
  var _loyaltyPoints=resaHistory.length*150;
  var _loyaltyLevel=_loyaltyPoints>=15000?"plat":_loyaltyPoints>=5000?"gold":_loyaltyPoints>=1000?"silver":"bronze";
  return(<div style={{paddingBottom:20}}><ImgViewer src={_viewer} onClose={function(){_setViewer(null);}}/><input id="hp-client-photo-input" ref={_uploadRef} type="file" accept="image/*" style={{display:"none"}} onChange={_handlePhotoFile}/>
    {_cpMenu&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:2000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={function(){_setCPMenu(false);_setCPPend(null);}}>
      <div onClick={function(e){e.stopPropagation();}} style={{width:"100%",maxWidth:420,background:DS.surface,borderRadius:"22px 22px 0 0",border:"1px solid "+DS.border,padding:"20px 16px 32px",animation:"hp-slide-up 0.28s ease"}}>
        {_cpPend?(
          <div>
            <div style={{textAlign:"center",fontSize:14,fontWeight:800,color:DS.text,marginBottom:14}}>Aperçu de la photo</div>
            <img src={_cpPend} alt="" style={{width:96,height:96,borderRadius:"50%",objectFit:"cover",display:"block",margin:"0 auto 16px",border:"3px solid "+DS.client}}/>
            <div style={{display:"flex",gap:10}}>
              <button onClick={function(){_setCPPend(null);}} style={{flex:1,padding:"13px",background:"transparent",border:"1px solid "+DS.border,borderRadius:12,color:DS.textMuted,fontSize:13,fontWeight:700,cursor:"pointer"}}>Annuler</button>
              <button onClick={_saveClientPhoto} style={{flex:1,padding:"13px",background:DS.client,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer"}}>Enregistrer</button>
            </div>
          </div>
        ):(
          <div>
            <div style={{textAlign:"center",fontSize:14,fontWeight:800,color:DS.text,marginBottom:20}}>Photo de profil</div>
            <label htmlFor="hp-client-photo-input" style={{width:"100%",padding:"15px 16px",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:14,borderBottom:"1px solid "+DS.border+"30",boxSizing:"border-box"}}>
              <div style={{width:36,height:36,borderRadius:10,background:DS.client+"18",display:"flex",alignItems:"center",justifyContent:"center"}}><Camera size={16} color={DS.client}/></div>
              <span style={{fontSize:14,color:DS.text,fontWeight:600}}>Changer la photo</span>
            </label>
            <button onClick={function(){if(profilePhoto){_setViewer(profilePhoto);_setCPMenu(false);}}} disabled={!profilePhoto} style={{width:"100%",padding:"15px 16px",background:"none",border:"none",cursor:profilePhoto?"pointer":"default",display:"flex",alignItems:"center",gap:14,borderBottom:"1px solid "+DS.border+"30",opacity:profilePhoto?1:0.35}}>
              <div style={{width:36,height:36,borderRadius:10,background:DS.primarySoft,display:"flex",alignItems:"center",justifyContent:"center"}}><Eye size={16} color={DS.primary}/></div>
              <span style={{fontSize:14,color:DS.text,fontWeight:600}}>Voir la photo</span>
            </button>
            <button onClick={profilePhoto?_deleteClientPhoto:undefined} disabled={!profilePhoto} style={{width:"100%",padding:"15px 16px",background:"none",border:"none",cursor:profilePhoto?"pointer":"default",display:"flex",alignItems:"center",gap:14,opacity:profilePhoto?1:0.35}}>
              <div style={{width:36,height:36,borderRadius:10,background:DS.errorSoft,display:"flex",alignItems:"center",justifyContent:"center"}}><Trash2 size={16} color={DS.error}/></div>
              <span style={{fontSize:14,color:DS.error,fontWeight:600}}>Supprimer la photo</span>
            </button>
          </div>
        )}
      </div>
    </div>)}
    {_showEditClient&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:2000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={function(){_setShowEditClient(false);}}>
      <div onClick={function(e){e.stopPropagation();}} style={{width:"100%",maxWidth:420,background:DS.surface,borderRadius:"22px 22px 0 0",border:"1px solid "+DS.border,padding:"20px 16px 32px",animation:"hp-slide-up 0.28s ease"}}>
        <div style={{textAlign:"center",fontSize:15,fontWeight:800,color:DS.text,marginBottom:20}}>Modifier le profil</div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,fontWeight:700,color:DS.textDim,marginBottom:5}}>NOM AFFICHÉ</div>
          <input value={_draftClientName} onChange={function(e){_setDraftClientName(e.target.value);}} placeholder="Votre prénom ou pseudo" maxLength={50} style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"11px 14px",fontSize:13,color:DS.text,outline:"none",boxSizing:"border-box"}}/>
          <div style={{fontSize:10,color:DS.textMuted,marginTop:4}}>Ce nom est visible par les établissements lors de vos réservations.</div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={function(){_setShowEditClient(false);}} style={{flex:1,padding:"13px",background:"transparent",border:"1px solid "+DS.border,borderRadius:12,color:DS.textMuted,fontSize:13,fontWeight:700,cursor:"pointer"}}>Annuler</button>
          <button onClick={_saveClientProfile} disabled={_clientSaving} style={{flex:1,padding:"13px",background:DS.client,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",opacity:_clientSaving?0.7:1}}>
            {_clientSaving?<span style={{display:"inline-block",width:14,height:14,border:"2px solid #fff",borderTopColor:"transparent",borderRadius:"50%",animation:"hp-spin 0.7s linear infinite",verticalAlign:"middle"}}/>:"Enregistrer"}
          </button>
        </div>
      </div>
    </div>)}<LoyaltyWidget points={_loyaltyPoints} level={_loyaltyLevel}/><div style={{background:"linear-gradient(180deg,"+DS.clientSoft+",transparent)",padding:"16px 16px 12px",textAlign:"center"}}><div style={{filter:_locked?"blur(3px)":"none",transition:"filter .3s",display:"inline-flex",justifyContent:"center"}}><DualAv sz={72} letter={displayLetter} innerImg={profilePhoto} onClickInner={function(){_setCPMenu(true);}} uploadRef={_uploadRef} verified={isPremium} isClient={true}/></div><div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,marginTop:10,filter:_locked&&!privacySettings.pseudo?"blur(2px)":"none"}}><span style={{fontSize:18,fontWeight:800,color:DS.text}}>{displayName}</span><button onClick={function(){_setDraftClientName(_rawName);_setShowEditClient(true);}} style={{background:"none",border:"none",cursor:"pointer",padding:"3px 8px",display:"flex",alignItems:"center",gap:4}}><Edit2 size={13} color={DS.client}/><span style={{fontSize:11,color:DS.client,fontWeight:700}}>Modifier</span></button></div><div style={{fontSize:12,color:DS.textMuted,marginTop:2}}>{(privacySettings.pseudo||_locked)?"":selfEmail||""}</div><div style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:4,padding:"3px 8px",borderRadius:20,border:"1px solid "+(_visColors[privacySettings.vis]||DS.success)+"44",background:(_visColors[privacySettings.vis]||DS.success)+"12"}}><Eye size={10} color={_visColors[privacySettings.vis]||DS.success}/><span style={{fontSize:9,fontWeight:700,color:_visColors[privacySettings.vis]||DS.success}}>{_visLabels[privacySettings.vis]||"Profil public"}</span>{_locked&&<><Lock size={8} color={DS.warning}/><span style={{fontSize:9,fontWeight:700,color:DS.warning}}>Verrouillé</span></>}</div><div style={{display:"flex",gap:8,marginTop:12,justifyContent:"center"}}>{!isPremium&&<button onClick={function(){if(onPremium)onPremium();}} style={{padding:"6px 14px",background:DS.goldSoft,border:"1px solid "+DS.gold+"33",borderRadius:20,color:DS.gold,fontSize:11,fontWeight:800,cursor:"pointer"}}>Premium & avantages</button>}{isPremium&&premiumData&&<button onClick={function(){if(onRenewPremium)onRenewPremium();}} style={{padding:"6px 14px",background:DS.goldSoft,border:"1px solid "+DS.gold+"33",borderRadius:20,color:DS.gold,fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}><VBadge sz={11}/>Actif jusqu'au {new Date(premiumData.expiresAt).toLocaleDateString("fr-FR")}</button>}<button onClick={function(){if(onSettings)onSettings();}} style={{padding:"7px 10px",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center"}}><Settings size={14} color={DS.textMuted}/></button>{onPrivacy&&<button onClick={function(){if(onPrivacy)onPrivacy();}} style={{padding:"7px 10px",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center"}}><Eye size={13} color={DS.textMuted}/></button>}</div></div><div style={{display:"flex",margin:"0 16px 12px",background:DS.card,borderRadius:12,border:"1px solid "+DS.border,overflow:"hidden"}}>{[[String(followingCount),"Suivis",null],[String(favEstabs.length),"Favoris","favoris"],[String(resaHistory.length),"Resas","reservations"]].map(function(_i,i){var n=_i[0];var l=_i[1];var tgt=_i[2];return <div key={l} onClick={function(){if(tgt)setTab(tgt);}} style={{flex:1,padding:"9px 0",textAlign:"center",borderRight:i<2?"1px solid "+DS.border:"none",cursor:tgt?"pointer":"default"}}><div style={{fontSize:18,fontWeight:800,color:tgt&&tab===tgt?DS.client:DS.text}}>{n}</div><div style={{fontSize:10,color:tgt&&tab===tgt?DS.client:DS.textMuted}}>{l}</div></div>;})}</div><div style={{display:"flex",gap:4,padding:"0 16px",marginBottom:12}}>{([["reservations","Réservations"],["favoris","Favoris"]].concat(isPremium&&premiumData&&premiumData.plan==="plus"?[["statistiques","Statistiques"]]:[])). map(function(_i){var t=_i[0];var l=_i[1];var isAct=tab===t;return <button key={t} onClick={function(){setTab(t);}} style={{flex:1,padding:"7px",borderRadius:10,border:"1px solid "+(isAct?DS.client:DS.border),background:isAct?DS.clientSoft:"transparent",color:isAct?DS.client:DS.textMuted,fontSize:11,fontWeight:700,cursor:"pointer"}}>{l}</button>;})}</div><div style={{padding:"0 16px"}}>{tab==="reservations"&&(
          (resaHistory&&resaHistory.length>0)?resaHistory.map(function(r,i){
            var showQR=activeQR===i;
            var st=r.status||"pending";
            var stLabel={pending:"En attente",refused:"Refusée",confirmed:"Acceptée",consumed:"Consommée"}[st]||"En attente";
            var stColor={pending:DS.warning,refused:DS.error,confirmed:DS.success,consumed:DS.textDim}[st]||DS.warning;
            var hasTicket=st!=="refused";
            return(
              <div key={i} style={{background:DS.card,borderRadius:14,marginBottom:12,border:"1px solid "+DS.border,overflow:"hidden",opacity:st==="refused"?0.65:1}}>
                <div style={{padding:"12px 14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:800,color:DS.text}}>{r.estab}</div>
                      <div style={{fontSize:12,color:DS.textMuted,marginTop:2}}>{r.service}</div>
                      <div style={{fontSize:11,color:DS.textDim,marginTop:2}}>{
                        r.estabType==="restaurant"
                          ?(r.dateIn+" - "+r.guests+" pers."+(r.tableCount?" - "+r.tableCount+" table"+(r.tableCount>1?"s":""):""))
                          :(r.dateIn+" au "+r.dateOut+" - "+r.guests+" pers."+(r.roomCount?" - "+r.roomCount+" chambre"+(r.roomCount>1?"s":""):""))
                      }</div>
                      {r.isCombo&&<div style={{fontSize:10,color:DS.primary,marginTop:2}}>{(r.comboMeals||[]).length} repas inclus{r.comboTable?" - Table au restaurant":""}</div>}
                    </div>
                    <div style={{textAlign:"right",flexShrink:0,marginLeft:8}}>
                      <div style={{fontSize:16,fontWeight:900,color:r.payMode==="avec"?DS.gold:DS.success}}>{r.payMode==="avec"?(r.total||0).toFixed(0)+" EUR":"Sans paiement"}</div>
                      <div style={{display:"flex",alignItems:"center",gap:4,marginTop:3,justifyContent:"flex-end"}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:stColor,flexShrink:0}}/>
                        <span style={{fontSize:10,color:stColor,fontWeight:700}}>{stLabel}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{fontSize:10,color:DS.textDim,fontFamily:"monospace",marginBottom:8}}>{r.id}</div>
                  {hasTicket&&(
                    <button onClick={function(){setActiveQR(showQR?null:i);}} style={{width:"100%",padding:"8px",background:DS.primary+"12",border:"1px solid "+DS.primary+"33",borderRadius:10,color:DS.primary,fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                      <Eye size={13}/>{showQR?"Masquer le ticket":"Voir le ticket QR"}
                    </button>
                  )}
                  {st==="pending"&&<div style={{fontSize:11,color:DS.warning,textAlign:"center",padding:"6px 0"}}>En attente de confirmation de l'établissement</div>}
                  {st==="refused"&&<div style={{fontSize:11,color:DS.error,textAlign:"center",padding:"6px 0"}}>Cette réservation a été refusée</div>}
                </div>
                {showQR&&hasTicket&&(
                  <div style={{borderTop:"1px solid "+DS.border,background:DS.surface,padding:"16px",textAlign:"center"}}>
                    <div style={{fontSize:11,fontWeight:800,color:DS.textDim,letterSpacing:1.5,marginBottom:12}}>TICKET DE RÉSERVATION - QR CODE</div>
                    <div style={{textAlign:"left",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"10px 12px",marginBottom:12}}>
                      {(r.estabType==="restaurant"?[
                        ["Convives",r.guests+" pers."],
                        ["Tables",(r.tableCount||1)+" table"+((r.tableCount||1)>1?"s":"")],
                        ["Date",r.dateIn],
                      ]:[
                        ["Voyageurs",r.guests+" pers."],
                        ["Nuits",r.nights+" nuit"+(r.nights>1?"s":"")],
                        ["Arrivée",r.dateIn],
                        ["Départ",r.dateOut],
                      ]).concat([["Paiement",r.payMode==="avec"?((r.total||0).toFixed(0)+" EUR - "+(r.payMethod==="card"?"Carte bancaire":"Mobile Money")):"Sans paiement (à l'arrivée)"]]).map(function(_i){var k=_i[0];var v=_i[1];return(
                        <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:11}}>
                          <span style={{color:DS.textMuted}}>{k}</span>
                          <span style={{color:DS.text,fontWeight:700}}>{v}</span>
                        </div>
                      );})}
                    </div>
                    {st==="pending"&&<div style={{background:DS.warningSoft,border:"1px solid "+DS.warning+"33",borderRadius:8,padding:"6px 10px",marginBottom:10,fontSize:10,color:DS.warning,fontWeight:700}}>En attente de confirmation - présentez ce code à l'établissement</div>}
                    <div style={{marginBottom:12,opacity:st==="consumed"?0.4:1}}><QRTicket id={r.id||"HP-000000"} sz={110}/></div>
                    <div style={{fontSize:10,color:DS.textDim,fontFamily:"monospace",letterSpacing:1,marginBottom:4}}>{r.id||"HP-000000"}</div>
                    {st==="consumed"
                      ? <div style={{fontSize:10,color:DS.textDim,fontWeight:600}}>Réservation consommée · présentée à l'établissement</div>
                      : st==="pending"
                      ? <div style={{fontSize:10,color:DS.warning,fontWeight:600}}>Ce code sera scannable une fois la réservation acceptée</div>
                      : <div style={{fontSize:10,color:DS.warning,fontWeight:600}}>Presentez ce code à l'établissement le jour de votre arrivée</div>
                    }
                  </div>
                )}
              </div>
            );
          })
          : <Emp Icon={Calendar} title="Aucune réservation" sub="Vos réservations apparaîtront ici apres votre premiere reservation"/>
        )}
        {tab==="favoris"&&(favEstabs.length>0?favEstabs.map(function(est){return(<div key={est.id} style={{background:DS.card,borderRadius:14,marginBottom:10,border:"1px solid "+DS.border,overflow:"hidden"}}><div style={{height:80,position:"relative"}}><img src={est.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>{est.verified&&<div style={{position:"absolute",top:6,left:8}}><VBadge sz={16}/></div>}</div><div style={{padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:13,fontWeight:800,color:DS.text}}>{est.name}</div><div style={{fontSize:11,color:DS.textMuted}}>{est.location}</div><div style={{display:"flex",alignItems:"center",gap:4,marginTop:2}}><Stars r={est.rating} sz={10}/><span style={{fontSize:10,color:DS.textMuted}}>({est.reviewCount})</span></div></div><div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:900,color:DS.gold}}>{est.priceFrom} EUR</div><div style={{fontSize:9,color:DS.textMuted}}>à partir de</div></div></div></div>);}):<Emp Icon={Heart} title="Aucun favori" sub="Appuyez sur le cœur d'un établissement pour l'ajouter"/>)}
        {tab==="statistiques"&&isPremium&&premiumData&&premiumData.plan==="plus"&&(<div>
          <div style={{background:DS.goldSoft,border:"1px solid "+DS.gold+"44",borderRadius:14,padding:"14px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}><VBadge sz={18}/><div><div style={{fontSize:13,fontWeight:800,color:DS.gold}}>Premium Plus — Statistiques profil</div><div style={{fontSize:11,color:DS.textMuted}}>Actif jusqu'au {new Date(premiumData.expiresAt).toLocaleDateString("fr-FR")}</div></div></div>
          {[[String(resaHistory.length),"Réservations totales",Calendar,DS.client],[String(favEstabs.length),"Établissements favoris",Heart,DS.error],[String(followingCount),"Abonnements actifs",Users,DS.primary],[premiumData.startedAt?new Date(premiumData.startedAt).toLocaleDateString("fr-FR"):"—","Membre Premium depuis",Star,DS.gold]].map(function(_i,idx){var val=_i[0];var lbl=_i[1];var Icon=_i[2];var col=_i[3];return(<div key={idx} style={{background:DS.card,border:"1px solid "+DS.border,borderRadius:14,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:14}}><div style={{width:40,height:40,borderRadius:12,background:col+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon size={18} color={col}/></div><div style={{flex:1}}><div style={{fontSize:11,color:DS.textMuted,fontWeight:600}}>{lbl}</div><div style={{fontSize:22,fontWeight:900,color:DS.text,marginTop:2}}>{val}</div></div></div>);})}
          <div style={{background:DS.card,border:"1px solid "+DS.border,borderRadius:14,padding:"14px 16px",marginBottom:10}}><div style={{fontSize:12,fontWeight:800,color:DS.text,marginBottom:10}}>Activité des réservations</div>{resaHistory.length===0?<div style={{fontSize:12,color:DS.textMuted,textAlign:"center",padding:"12px 0"}}>Aucune réservation enregistrée</div>:[["Confirmées",resaHistory.filter(function(r){return r.status==="confirmed";}).length,DS.success],["En attente",resaHistory.filter(function(r){return r.status==="pending";}).length,DS.warning],["Consommées",resaHistory.filter(function(r){return r.status==="consumed";}).length,DS.primary],["Refusées",resaHistory.filter(function(r){return r.status==="refused";}).length,DS.error]].map(function(_i,i){var lbl=_i[0];var cnt=_i[1];var col=_i[2];return(<div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:i<3?8:0}}><div style={{width:8,height:8,borderRadius:"50%",background:col,flexShrink:0}}/><div style={{flex:1,fontSize:12,color:DS.textMuted}}>{lbl}</div><div style={{fontSize:13,fontWeight:800,color:DS.text}}>{cnt}</div></div>);})}</div>
        </div>)}
        </div></div>);
}

function ESTAB_TABS_BUILD(isHotel,e,resaType,viewerIsPro){
  var tabs=[["about","À propos"]];
  if(isHotel)tabs.push(["amenities","Equipements"]);
  var isCombinedEstab=isHotel&&e&&e.svcMode==="combined";
  if(isCombinedEstab){
    if(viewerIsPro){
      tabs.push(["rooms","Chambres"]);
      tabs.push(["menu","Menu"]);
    }
    else if(resaType==="hotel")tabs.push(["rooms","Chambres"]);
    else if(resaType==="restaurant")tabs.push(["menu","Menu"]);
    else if(resaType==="combined")tabs.push(["combo","Séjour combiné"]);
  } else {
    if(isHotel)tabs.push(["rooms","Chambres"]);
    if(!isHotel)tabs.push(["menu","Menu"]);
  }
  tabs.push(["reviews","Avis"]);
  return tabs;
}
function EstabM(props){
  var e=props.e;var rawOnClose=props.onClose;var onBook=props.onBook;var onChat=props.onChat;var viewerIsPro=props.viewerIsPro||false;var selfUserId=props.selfUserId||null;
  try{
    var _h0=DataLayer.getHotels()[0];var _r0=DataLayer.getRestaurants()[0];
    if(_h0&&e&&e.id===_h0.id){
      var _rmsRaw=localStorage.getItem("hp_hotelsvc_rooms");var _amsRaw=localStorage.getItem("hp_hotelsvc_amenities");var _dshRaw=localStorage.getItem("hp_hotelsvc_dishes");var _descRawH=localStorage.getItem("hp_pro_desc_hotel");
      var _patch={};
      if(_rmsRaw){var _rms=JSON.parse(_rmsRaw);_patch.rooms=_rms;var _avail=_rms.filter(function(r){return r.available&&r.price>0;});if(_avail.length){var _minH=Math.min.apply(null,_avail.map(function(r){return r.price;}));if(_minH>0)_patch.priceFrom=_minH;}}
      if(_amsRaw)_patch.services=JSON.parse(_amsRaw).filter(function(a){return a.active!==false;});
      if(_dshRaw){var _fl=JSON.parse(_dshRaw);var _mc={};_fl.forEach(function(d){var c=d.category||"Plats";if(!_mc[c])_mc[c]=[];_mc[c].push(d);});_patch.menu=Object.keys(_mc).map(function(c){return{cat:c,items:_mc[c]};});}
      if(_descRawH)_patch.description=_descRawH;
      if(Object.keys(_patch).length)e=Object.assign({},e,_patch);
    }else if(_r0&&e&&e.id===_r0.id){
      var _itRaw=localStorage.getItem("hp_restoff_items");var _ofRaw=localStorage.getItem("hp_restoff_offers");var _descRawR=localStorage.getItem("hp_pro_desc_restaurant");
      var _patch2={};
      if(_itRaw){var _fl2=JSON.parse(_itRaw);var _mc2={};_fl2.forEach(function(d){var c=d.category||"Plats";if(!_mc2[c])_mc2[c]=[];_mc2[c].push(d);});_patch2.menu=Object.keys(_mc2).map(function(c){return{cat:c,items:_mc2[c]};});var _availR=_fl2.filter(function(d){return d.available&&d.price>0;});if(_availR.length){var _minR=Math.min.apply(null,_availR.map(function(d){return d.price;}));if(_minR>0)_patch2.priceFrom=_minR;}}
      if(_ofRaw)_patch2.offers=JSON.parse(_ofRaw).filter(function(o){return o.available!==false;});
      if(_descRawR)_patch2.description=_descRawR;
      if(Object.keys(_patch2).length)e=Object.assign({},e,_patch2);
    }
  }catch(_ex){}
  var scl=useState(false);var closingE=scl[0];var setClosingE=scl[1];
  function onClose(){if(closingE)return;setClosingE(true);setTimeout(function(){if(rawOnClose)rawOnClose();},260);}
  var s1=useState("about");var tab=s1[0];var setTab=s1[1];
  var s2=useState(0);var rating=s2[0];var setRating=s2[1];
  var s2t=useState("");var reviewText=s2t[0];var setReviewText=s2t[1];
  var _rvKey="hp_reviews_"+(e&&e.id||"x");
  var s2r=useState(function(){try{var v=localStorage.getItem(_rvKey);return v?JSON.parse(v):[];}catch(ex){return[];}});var localReviews=s2r[0];var setLocalReviews=s2r[1];
  var s9=useState([]);var selectedDishes=s9[0];var setSelectedDishes=s9[1];
  var allItems=(e&&e.menu||[]).reduce(function(acc,cat){return acc.concat(cat.items.map(function(it){return Object.assign({},it,{cat:cat.cat});}));},[]); 
  var selectedDishesTotal=allItems.filter(function(it){return selectedDishes.indexOf(it.cat+"-"+it.name)>=0;}).reduce(function(sum,it){return sum+(it.price||0);},0);
  var sr=useState("hotel");var resaType=sr[0];var setResaType=sr[1];
  var scr=useState(null);var comboRoom=scr[0];var setComboRoom=scr[1];
  var scm=useState([]);var comboMeals=scm[0];var setComboMeals=scm[1];
  var sct=useState(false);var comboTable=sct[0];var setComboTable=sct[1];
  function toggleComboMeal(id){setComboMeals(function(ms){return ms.indexOf(id)>=0?ms.filter(function(x){return x!==id;}):ms.concat([id]);});}
  var t=useToast();var toast=t.show;var Toast=t.Toast;
  if(!e)return null;
  var followingIds=props.followingIds||[];
  var isFollowing=followingIds.indexOf(e.id)>=0;
  var followersCount=(e.followers||0)+(isFollowing?1:0);
  function toggleFollow(){if(props.onToggleFollow)props.onToggleFollow(e.id);}
  var favEstabIds=props.favEstabIds||[];
  var isFavEstab=favEstabIds.indexOf(e.id)>=0;
  function toggleFavEstab(){if(props.onToggleFavEstab)props.onToggleFavEstab(e.id);}
  var color=rC(e.type);var isHotel=e.type==="hotel";
  var isCombinedEstab=isHotel&&e.svcMode==="combined";
  var comboMealsTotal=(e.meals||[]).filter(function(m){return comboMeals.indexOf(m.id)>=0;}).reduce(function(s,m){return s+m.price;},0);
  var comboTotal=(comboRoom?comboRoom.price:0)+comboMealsTotal;
  var _sEV=useState(null);var _eViewer=_sEV[0];var _setEViewer=_sEV[1];
  return(<div style={{position:"fixed",inset:0,background:DS.bg,zIndex:900,maxWidth:420,margin:"0 auto",overflowY:"auto",WebkitOverflowScrolling:"touch",touchAction:"pan-y",animation:(closingE?"hp-slide-out-right 0.26s cubic-bezier(0.4,0,1,1) forwards":"hp-slide-right 0.32s cubic-bezier(0.22,1,0.36,1)"),boxShadow:"-8px 0 24px rgba(0,0,0,.35)"}}><ImgViewer src={_eViewer} onClose={function(){_setEViewer(null);}}/><Toast/><div style={{position:"relative",height:220,flexShrink:0}}><img src={e.img} alt="" onClick={function(){if(e.img)_setEViewer(e.img);}} style={{width:"100%",height:"100%",objectFit:"cover",cursor:"pointer"}}/><div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,.2),rgba(0,0,0,.6))",pointerEvents:"none"}}/><div style={{position:"absolute",top:12,left:12}}><BackBtn onClick={onClose} light={true}/></div><div style={{position:"absolute",bottom:-48,left:16,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2}} onClick={function(){if(e.img)_setEViewer(e.img);}}><Av sz={68} letter={(e.name[0]||"H").toUpperCase()} img={e.img} verified={e.verified||false}/>{e.verified&&<div style={{background:"#14532d",borderRadius:6,padding:"1px 6px",marginTop:1}}><span style={{fontSize:9,fontWeight:800,color:"#4ade80",letterSpacing:"0.01em"}}>Vérifié</span></div>}</div></div><div style={{padding:"58px 16px 8px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}><div><div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><div style={{fontSize:20,fontWeight:900,color:DS.text}}>{e.name}</div></div><a href={"https://maps.google.com/?q="+encodeURIComponent(e.name+" "+e.location)} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:DS.primary,cursor:"pointer",display:"flex",alignItems:"center",gap:4,textDecoration:"none"}}><MapPin size={11}/>{e.location}</a></div><div style={{textAlign:"right"}}><div style={{fontSize:18,fontWeight:900,color:DS.gold}}>À partir de {e.priceFrom}€</div></div></div><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><Stars r={e.rating} sz={15}/><span style={{fontSize:13,fontWeight:800,color:DS.text}}>{e.rating}</span><span style={{fontSize:13,color:DS.textDim}}>-</span><span style={{fontSize:13,fontWeight:700,color:DS.text}}>{fmtK(followersCount)}</span><span style={{fontSize:12,color:DS.textMuted}}>abonnes</span></div><div style={{display:"flex",gap:8,marginBottom:16}}>{viewerIsPro
                ? <div style={{flex:2,padding:"9px 14px",background:DS.card,border:"1px solid "+DS.border,borderRadius:20,color:DS.textDim,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:5,minHeight:36}}><Lock size={12}/>Reservation indisponible</div>
                : <button onClick={function(){if(isCombinedEstab){setTab(resaType==="restaurant"?"menu":resaType==="combined"?"combo":"rooms");}else if(onBook){onBook(e);}}} style={{flex:2,padding:"9px 14px",background:color,border:"none",borderRadius:20,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5,minHeight:36}}><Calendar size={13}/>Réserver</button>}<button onClick={function(){if(onChat)onChat(e);if(onClose)onClose();}} style={{flex:viewerIsPro?2:1,padding:"9px 8px",background:DS.card,border:"1px solid "+DS.border,borderRadius:20,color:DS.textMuted,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4,minHeight:36}}><MessageCircle size={13}/>Chat</button>{e.isPremium&&e.location?<a href={"https://maps.google.com/?q="+encodeURIComponent(e.name+" "+e.location)} target="_blank" rel="noopener noreferrer" style={{width:36,height:36,background:DS.card,border:"1px solid "+DS.border,borderRadius:20,display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",flexShrink:0}} title="Voir sur la carte"><MapPin size={15} color={DS.primary}/></a>:<div style={{width:36,height:36,background:DS.card,border:"1px solid "+DS.border,borderRadius:20,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,opacity:0.35,cursor:"not-allowed"}} title="Localisation GPS disponible pour les établissements Premium"><MapPin size={15} color={DS.textMuted}/></div>}<button onClick={toggleFollow} style={{flex:1,padding:"9px 8px",background:isFollowing?color+"18":DS.card,border:"1px solid "+(isFollowing?color:DS.border),borderRadius:20,color:isFollowing?color:DS.textMuted,fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4,minHeight:36}}>{isFollowing?<UserCheck size={14} color={color}/>:<UserPlus size={14} color={DS.textMuted}/>}{isFollowing?"Suivi":"Suivre"}</button><button onClick={toggleFavEstab} style={{width:36,height:36,background:isFavEstab?DS.error+"18":DS.card,border:"1px solid "+(isFavEstab?DS.error+"55":DS.border),borderRadius:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"background .2s,border .2s"}}><Heart size={15} color={DS.error} fill={isFavEstab?DS.error:"none"}/></button></div>{isCombinedEstab&&!viewerIsPro&&<div style={{marginBottom:14}}><div style={{fontSize:11,fontWeight:700,color:DS.textDim,letterSpacing:1,marginBottom:6}}>TYPE DE RESERVATION</div><div style={{display:"flex",flexDirection:"column",gap:6}}>{[["hotel","Hotel uniquement"],["restaurant","Restaurant uniquement"],["combined","Reservation combinee (Hotel + Restaurant)"]].map(function(_i){var v=_i[0];var l=_i[1];var isSel=resaType===v;return(<button key={v} onClick={function(){setResaType(v);setTab(v==="restaurant"?"menu":v==="combined"?"combo":"rooms");}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,border:"1.5px solid "+(isSel?color+"66":DS.border),background:isSel?color+"0C":DS.card,cursor:"pointer",textAlign:"left"}}><div style={{width:16,height:16,borderRadius:"50%",border:"2px solid "+(isSel?color:DS.border),background:isSel?color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{isSel&&<div style={{width:6,height:6,borderRadius:"50%",background:"#fff"}}/>}</div><span style={{fontSize:12,color:isSel?color:DS.text,fontWeight:isSel?700:400}}>{l}</span></button>);})}</div></div>}<div style={{display:"flex",gap:4,marginBottom:16}}>{ESTAB_TABS_BUILD(isHotel,e,resaType,viewerIsPro).map(function(_i){var t2=_i[0];var l=_i[1];var isAct=tab===t2;return <button key={t2} onClick={function(){setTab(t2);}} style={{flex:1,padding:"8px 4px",borderRadius:10,border:"1px solid "+(isAct?color:DS.border),background:isAct?color+"18":"transparent",color:isAct?color:DS.textMuted,fontSize:11,fontWeight:700,cursor:"pointer",textAlign:"center"}}>{l}</button>;})} </div>{tab==="about"&&<div><div style={{fontSize:13,color:DS.textMuted,lineHeight:1.6}}>{e.description}</div></div>}{tab==="amenities"&&<div>{(e.services||[]).filter(function(s){return typeof s==="string"||s.active!==false;}).map(function(s,i){var nm=typeof s==="string"?s:s.name;var Ic=getIcon(nm);var actSvcs=(e.services||[]).filter(function(x){return typeof x==="string"||x.active!==false;});return(<div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:i<actSvcs.length-1?"1px solid "+DS.border+"20":"none"}}><div style={{width:28,height:28,borderRadius:8,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic size={13} color={color}/></div><span style={{fontSize:12,color:DS.text}}>{nm}</span></div>);})}</div>}{tab==="rooms"&&isHotel&&(e.rooms||[]).map(function(r){return(<div key={r.id} style={{background:DS.card,borderRadius:12,padding:"12px 14px",marginBottom:10,border:"1px solid "+DS.border}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}><div><div style={{fontSize:13,fontWeight:700,color:DS.text}}>{r.name}</div><div style={{fontSize:11,color:DS.textMuted}}>{r.capacity} personnes</div></div><div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:900,color:DS.gold}}>{r.price} EUR</div><div style={{fontSize:9,color:DS.textMuted}}>par nuit</div></div></div>{viewerIsPro
                    ? <div style={{width:"100%",padding:"8px",background:"transparent",border:"1px solid "+DS.border,borderRadius:8,color:DS.textDim,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}><Lock size={11}/>Reservation indisponible</div>
                    : <button onClick={function(){if(r.available&&onBook)onBook(Object.assign({},e,{selectedRoom:r}));}} style={{width:"100%",padding:"8px",background:r.available?color:"transparent",border:"1px solid "+(r.available?color:DS.textDim),borderRadius:8,color:r.available?"#fff":DS.textDim,fontSize:12,fontWeight:700,cursor:r.available?"pointer":"not-allowed"}}>{r.available?"Reserver":"Non disponible"}</button>}</div>);})}{tab==="combo"&&isCombinedEstab&&(
            <div>
              <div style={{fontSize:12,fontWeight:800,color:color,letterSpacing:1.5,marginBottom:10}}>CHOISIR UNE CHAMBRE</div>
              {(e.rooms||[]).filter(function(r){return r.available;}).map(function(r){
                var isSel=comboRoom&&comboRoom.id===r.id;
                return(
                  <div key={r.id} onClick={function(){setComboRoom(r);}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",marginBottom:6,borderRadius:12,border:"1.5px solid "+(isSel?color+"66":DS.border+"40"),background:isSel?color+"0C":DS.card,cursor:"pointer"}}>
                    <div style={{width:18,height:18,borderRadius:"50%",border:"2px solid "+(isSel?color:DS.border),background:isSel?color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{isSel&&<div style={{width:7,height:7,borderRadius:"50%",background:"#fff"}}/>}</div>
                    <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:isSel?color:DS.text}}>{r.name}</div><div style={{fontSize:11,color:DS.textMuted}}>{r.capacity} personnes</div></div>
                    <div style={{fontSize:14,fontWeight:900,color:DS.gold}}>{r.price} EUR</div>
                  </div>
                );
              })}
              <div style={{fontSize:12,fontWeight:800,color:color,letterSpacing:1.5,marginTop:18,marginBottom:10}}>REPAS INCLUS</div>
              {(e.meals||[]).map(function(m){
                var isSel=comboMeals.indexOf(m.id)>=0;
                return(
                  <div key={m.id} onClick={function(){toggleComboMeal(m.id);}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",marginBottom:6,borderRadius:12,border:"1.5px solid "+(isSel?color+"66":DS.border+"40"),background:isSel?color+"0C":DS.card,cursor:"pointer"}}>
                    <div style={{width:20,height:20,borderRadius:6,border:"2px solid "+(isSel?color:DS.border),background:isSel?color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{isSel&&<CheckCircle size={11} color="#fff"/>}</div>
                    <div style={{flex:1,fontSize:13,color:isSel?color:DS.text,fontWeight:isSel?700:400}}>{m.name}</div>
                    <div style={{fontSize:13,fontWeight:700,color:DS.gold}}>{m.price} EUR</div>
                  </div>
                );
              })}
              <div onClick={function(){setComboTable(!comboTable);}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",marginTop:10,borderRadius:12,border:"1.5px solid "+(comboTable?color+"66":DS.border+"40"),background:comboTable?color+"0C":DS.card,cursor:"pointer"}}>
                <div style={{width:20,height:20,borderRadius:6,border:"2px solid "+(comboTable?color:DS.border),background:comboTable?color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{comboTable&&<CheckCircle size={11} color="#fff"/>}</div>
                <div style={{flex:1,fontSize:13,color:comboTable?color:DS.text,fontWeight:comboTable?700:400}}>Table au restaurant incluse</div>
              </div>
              {(comboRoom||comboMeals.length>0)&&(
                <div style={{position:"sticky",bottom:0,background:DS.surface,padding:"14px 0 4px",borderTop:"1px solid "+DS.border+"30",marginTop:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div style={{fontSize:12,color:DS.textMuted}}>{comboRoom?"1 chambre":"Aucune chambre"} + {comboMeals.length} repas{comboTable?" + table":""}</div>
                    <div style={{fontSize:14,fontWeight:900,color:DS.gold}}>{comboTotal.toFixed(0)} EUR / nuit</div>
                  </div>
                  <button onClick={function(){if(viewerIsPro)return;if(comboRoom&&onBook)onBook(Object.assign({},e,{selectedRoom:comboRoom,comboMeals:comboMeals,comboTable:comboTable,comboTotal:comboTotal,isCombo:true}));else toast("Sélectionnez d'abord une chambre","error");}} style={{width:"100%",padding:"11px",background:comboRoom?color:DS.textDim,border:"none",borderRadius:14,color:"#fff",fontSize:13,fontWeight:800,cursor:comboRoom?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:comboRoom?1:0.6,transition:"background .2s,opacity .2s"}}>
                    <Calendar size={14}/>Réserver le séjour combiné
                  </button>
                </div>
              )}
            </div>
          )}{tab==="menu"&&(resaType==="restaurant"||!isHotel)&&(
            <div>
              {!isHotel&&(e.offers||[]).length>0&&(
                <div style={{marginBottom:18}}>
                  <div style={{fontSize:12,fontWeight:800,color:color,letterSpacing:1.5,marginBottom:8}}>OFFRES SPECIALES</div>
                  {(e.offers||[]).map(function(o,oi){return(
                    <div key={o.id||oi} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",marginBottom:8,borderRadius:12,border:"1.5px solid "+color+"44",background:color+"0A"}}>
                      <div style={{width:32,height:32,borderRadius:9,background:color+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Tag size={14} color={color}/></div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:DS.text}}>{o.name}</div>
                      </div>
                      {o.price&&<div style={{fontSize:14,fontWeight:900,color:DS.gold,flexShrink:0}}>{o.price} EUR</div>}
                    </div>
                  );})}
                </div>
              )}
              {(e.menu||[]).map(function(cat,ci){return(
                <div key={ci} style={{marginBottom:18}}>
                  <div style={{fontSize:12,fontWeight:800,color:color,letterSpacing:1.5,marginBottom:8}}>{cat.cat.toUpperCase()}</div>
                  {cat.items.map(function(item,ji){
                    var isAvail=item.available!==false;
                    var isSel=isAvail&&selectedDishes.indexOf(cat.cat+"-"+item.name)>=0;
                    return(
                      <div key={ji} onClick={function(){if(!isAvail)return;var k=cat.cat+"-"+item.name;setSelectedDishes(function(prev){return prev.indexOf(k)>=0?prev.filter(function(x){return x!==k;}):prev.concat([k]);});}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",marginBottom:6,borderRadius:12,border:"1.5px solid "+(isSel?color+"66":DS.border+"40"),background:isSel?color+"0C":DS.card,cursor:isAvail?"pointer":"not-allowed",transition:"all .15s",opacity:isAvail?1:0.5}}>
                        <div style={{width:22,height:22,borderRadius:6,border:"2px solid "+(isSel?color:DS.border),background:isSel?color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          {isSel&&<CheckCircle size={12} color="#fff"/>}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:isSel?700:500,color:isSel?color:DS.text}}>{item.name}</div>
                          {item.description&&<div style={{fontSize:10,color:DS.textMuted,marginTop:1}}>{item.description}</div>}
                          {!isAvail&&<div style={{fontSize:10,color:DS.error,fontWeight:700,marginTop:2}}>Indisponible</div>}
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontSize:14,fontWeight:900,color:isAvail?DS.gold:DS.textDim}}>{item.price} EUR</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );})}
              {selectedDishes.length>0&&(
                <div style={{position:"sticky",bottom:0,background:DS.surface,padding:"12px 0 4px",borderTop:"1px solid "+DS.border+"30"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div style={{fontSize:12,color:DS.textMuted}}>{selectedDishes.length} plat{selectedDishes.length>1?"s":""} sélectionné{selectedDishes.length>1?"s":""}</div>
                    <div style={{fontSize:13,fontWeight:900,color:DS.gold}}>{selectedDishesTotal.toFixed(2)} EUR</div>
                  </div>
                  {viewerIsPro
                  ? <div style={{width:"100%",padding:"11px",background:DS.card,border:"1px solid "+DS.border,borderRadius:14,color:DS.textDim,fontSize:12,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Lock size={13}/>Reservation indisponible entre etablissements</div>
                  : <button onClick={function(){if(onBook)onBook(Object.assign({},e,{selectedDishes:selectedDishes,dishTotal:selectedDishesTotal}));}} style={{width:"100%",padding:"11px",background:color,border:"none",borderRadius:14,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                    <Calendar size={14}/>Reserver ({selectedDishes.length} plat{selectedDishes.length>1?"s":""})
                  </button>}
                </div>
              )}
            </div>
          )}{tab==="reviews"&&<div><div style={{marginBottom:14}}><div style={{marginBottom:6,fontSize:12,fontWeight:700,color:DS.text}}>Laisser un avis</div><div style={{display:"flex",gap:6,marginBottom:8}}>{[1,2,3,4,5].map(function(i){return <button key={i} onClick={function(){setRating(i);}} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><Star size={24} fill={i<=rating?"#F59E0B":"none"} color={i<=rating?"#F59E0B":DS.border} strokeWidth={1.5}/></button>;})} </div><textarea value={reviewText} onChange={function(ev){setReviewText(ev.target.value);}} placeholder="Partagez votre experience..." rows={3} style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"10px 12px",fontSize:12,color:DS.text,outline:"none",resize:"none",lineHeight:1.5,boxSizing:"border-box",marginBottom:8}}/><div style={{display:"flex",justifyContent:"flex-end"}}><button disabled={rating===0} onClick={function(){if(rating>0){var rv={id:"rv"+Date.now(),rating:rating,text:reviewText.trim(),date:new Date().toLocaleDateString("fr-FR"),author:"Vous"};var next=[rv].concat(localReviews);setLocalReviews(next);try{localStorage.setItem(_rvKey,JSON.stringify(next));}catch(ex){}try{DataLayer.saveReview(e&&e.id,rv,selfUserId||null);}catch(ex2){}toast("Avis publié","success");setRating(0);setReviewText("");}}} style={{padding:"8px 20px",background:rating>0?color:DS.textDim,border:"none",borderRadius:20,color:"#fff",fontSize:12,fontWeight:700,cursor:rating>0?"pointer":"not-allowed",opacity:rating>0?1:.6}}>Publier</button></div></div>{localReviews.length>0?localReviews.map(function(rv){return(<div key={rv.id} style={{background:DS.card,borderRadius:12,padding:"12px 14px",marginBottom:8,border:"1px solid "+DS.border}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><Stars r={rv.rating} sz={12}/><span style={{fontSize:10,color:DS.textDim}}>{rv.date}</span></div>{rv.text&&<div style={{fontSize:12,color:DS.textMuted,lineHeight:1.5}}>{rv.text}</div>}</div>);}):localReviews.length===0&&<Emp Icon={Star} title="Aucun avis" sub="Soyez le premier à partager votre expérience"/>}</div>}</div></div>);
}

// Formulaire de paiement Stripe — monté dans un Elements provider
function StripeCheckoutForm(props){
  var amount=props.amount;var onSuccess=props.onSuccess;var onError=props.onError;var color=props.color;
  var stripe=useStripe();
  var elements=useElements();
  var sProc=useState(false);var processing=sProc[0];var setProcessing=sProc[1];
  var sErr=useState(null);var stripeError=sErr[0];var setStripeError=sErr[1];
  async function handlePay(ev){
    ev.preventDefault();
    if(!stripe||!elements||processing) return;
    setProcessing(true);
    setStripeError(null);
    var result=await stripe.confirmPayment({elements:elements,redirect:"if_required"});
    if(result.error){
      setStripeError(result.error.message);
      setProcessing(false);
      if(onError) onError(result.error.message);
    } else if(result.paymentIntent&&result.paymentIntent.status==="succeeded"){
      if(onSuccess) onSuccess(result.paymentIntent);
    }
  }
  return(
    <form onSubmit={handlePay}>
      <PaymentElement options={{layout:"tabs"}}/>
      {stripeError&&(
        <div style={{marginTop:12,padding:"10px 12px",background:"#FEE2E2",borderRadius:10,fontSize:12,color:"#DC2626",lineHeight:1.4}}>{stripeError}</div>
      )}
      <button type="submit" disabled={!stripe||processing} style={{width:"100%",marginTop:16,padding:"13px",background:processing?"#9CA3AF":color,border:"none",borderRadius:12,color:"#fff",fontSize:14,fontWeight:900,cursor:!stripe||processing?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"background .2s"}}>
        {processing
          ? <><span style={{display:"inline-block",width:14,height:14,border:"2px solid #fff",borderTopColor:"transparent",borderRadius:"50%",animation:"hp-spin 0.7s linear infinite"}}/><span>Traitement en cours...</span></>
          : <><CreditCard size={15}/><span>Payer {amount} EUR</span></>
        }
      </button>
      <div style={{textAlign:"center",marginTop:10,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
        <Shield size={11} color="#6B7280"/>
        <span style={{fontSize:10,color:"#6B7280"}}>Paiement sécurisé par Stripe · Certifié PCI DSS</span>
      </div>
    </form>
  );
}

// Modal complète Stripe avec Elements provider
function StripePaymentModal(props){
  var clientSecret=props.clientSecret;var amount=props.amount;var color=props.color;
  var onSuccess=props.onSuccess;var onError=props.onError;var onClose=props.onClose;
  if(!_stripePromise||!clientSecret) return null;
  var DS_=props.DS||{surface:"#1a1a2e",border:"#2d2d4e",text:"#f0f0f0",textMuted:"#9ca3af"};
  var appearance={theme:"night",variables:{colorPrimary:color,borderRadius:"10px",fontFamily:"system-ui,sans-serif"}};
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:1200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:420,background:DS_.surface,borderRadius:"22px 22px 0 0",border:"1px solid "+DS_.border,padding:"20px 20px 36px",maxHeight:"90vh",overflowY:"auto",animation:"hp-slide-up 0.3s ease"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:DS_.text}}>Paiement sécurisé</div>
            <div style={{fontSize:11,color:DS_.textMuted,marginTop:2}}>Traité par Stripe · Crypté 256-bit</div>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:"none",cursor:"pointer",padding:4}}><X size={18} color={DS_.textMuted}/></button>
        </div>
        <div style={{background:color+"15",border:"1px solid "+color+"33",borderRadius:10,padding:"10px 14px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:12,color:DS_.textMuted,fontWeight:600}}>Total à payer</span>
          <span style={{fontSize:20,fontWeight:900,color:color}}>{amount} EUR</span>
        </div>
        <Elements stripe={_stripePromise} options={{clientSecret:clientSecret,appearance:appearance}}>
          <StripeCheckoutForm amount={amount} onSuccess={onSuccess} onError={onError} color={color} DS={DS_}/>
        </Elements>
      </div>
    </div>
  );
}

function QRTicket(props){var id=props.id||"HP-000000";var sz=props.sz||110;return(<div style={{display:"inline-flex",padding:10,background:"#fff",borderRadius:10}}><QRCodeSVG value={id} size={sz} level="M" includeMargin={false}/></div>);}
function BookM(props){
  var e=props.e;var onClose=props.onClose;
  if(!e)return null;
  var color=rC(e.type);
  var s1=useState(1);var step=s1[0];var setStep=s1[1];
  var s2=useState(2);var guests=s2[0];var setGuests=s2[1];
  var s2b=useState(1);var roomCount=s2b[0];var setRoomCount=s2b[1];
  var s2c=useState(1);var tableCount=s2c[0];var setTableCount=s2c[1];
  var s3=useState("");var dateIn=s3[0];var setDateIn=s3[1];
  var s3b=useState(1);var nightsCount=s3b[0];var setNightsCount=s3b[1];
  function computeDateOut(din,nc){if(!din)return"";var d=new Date(din);d.setDate(d.getDate()+nc);return d.toISOString().slice(0,10);}
  var s5=useState("sans");var payMode=s5[0];var setPayMode=s5[1];
  var s6=useState("mobile");var payMethod=s6[0];var setPayMethod=s6[1];
  var spay=useState(false);var paying=spay[0];var setPaying=spay[1];
  var sSCS=useState(null);var stripeClientSecret=sSCS[0];var setStripeClientSecret=sSCS[1];
  var sSM=useState(false);var showStripeModal=sSM[0];var setShowStripeModal=sSM[1];
  var sC=useState(false);var closing=sC[0];var setClosing=sC[1];
  var cT=useRef(null);
  function handleClose(){if(closing)return;setClosing(true);cT.current=setTimeout(function(){onClose();},260);}
  useEffect(function(){return function(){if(cT.current)clearTimeout(cT.current);};},[]);
  var tk=useToast();var toast=tk.show;var Toast=tk.Toast;
  var _ridRef=useRef(null);if(!_ridRef.current){_ridRef.current="HP-"+Math.floor(100000+Math.random()*900000);}
  var resaId=_ridRef.current;
  var _today=new Date().toISOString().slice(0,10);
  var selfEmail=props.selfEmail||"";
  var selfUserId=props.selfUserId||null;
  var clientName=props.selfName||(function(){try{return localStorage.getItem("hp_client_display_name")||"";}catch(e){return "";}}())||(selfEmail.split("@")[0]||"Client");
  var isCombo=e.isCombo===true;
  var hasDishes=e.selectedDishes&&e.selectedDishes.length>0;
  var isHotelBooking=e.type==="hotel";
  var isRestaurantBooking=e.type==="restaurant";
  var nights=isHotelBooking?nightsCount:1;
  var dateOut=isHotelBooking?(dateIn?computeDateOut(dateIn,nightsCount):""):dateIn;
  var basePrice=isCombo?e.comboTotal:(hasDishes?e.dishTotal:(e.selectedRoom?e.selectedRoom.price:e.priceFrom));
  var totalPrice=isCombo?basePrice*nights:(hasDishes?basePrice*tableCount:(isHotelBooking?basePrice*nights*roomCount:basePrice*tableCount));
  var serviceLabel=isCombo?("Séjour combiné - "+e.selectedRoom.name):(hasDishes?(e.selectedDishes.length+" plat"+(e.selectedDishes.length>1?"s":"")+" sélectionné"+(e.selectedDishes.length>1?"s":"")):(e.selectedRoom?e.selectedRoom.name:(e.type==="hotel"?"Chambre Standard":"Réservation")));
  var guestsLabel=isRestaurantBooking?"NOMBRE DE CONVIVES":"NOMBRE DE VOYAGEURS";
  var dateLabel=isRestaurantBooking?"DATE DE RESERVATION":"DATE D'ARRIVÉE";
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:1100,display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"hp-fade 0.2s ease"}}>
      <div style={{width:"100%",maxWidth:420,background:DS.surface,borderRadius:"22px 22px 0 0",border:"1px solid "+DS.border,maxHeight:"94vh",overflowY:"auto",WebkitOverflowScrolling:"touch",touchAction:"pan-y",animation:closing?"hp-sheet-out 0.26s ease forwards":"hp-slide-up 0.3s ease"}}>
        <Toast/>
        {showStripeModal&&stripeClientSecret&&(
          <StripePaymentModal
            clientSecret={stripeClientSecret}
            amount={totalPrice.toFixed(0)}
            color={color}
            DS={DS}
            onClose={function(){setShowStripeModal(false);setStripeClientSecret(null);}}
            onSuccess={function(){
              setShowStripeModal(false);setStripeClientSecret(null);
              var resa={id:resaId,clientName:clientName,estab:e.name,estabType:e.type,service:serviceLabel,dateIn:dateIn,dateOut:dateOut,nights:nights,guests:guests,roomCount:isCombo?1:(isHotelBooking?roomCount:null),tableCount:isRestaurantBooking?tableCount:null,total:totalPrice,payMode:"avec",payMethod:"card",qr:resaId,status:"confirmed",isCombo:isCombo,comboMeals:isCombo?e.comboMeals:null,comboTable:isCombo?e.comboTable:null};
              setStep(3);
              toast("Paiement Stripe confirmé !","success");
              if(props.onBooked)props.onBooked(BookingService.createBooking(resa,selfUserId));
            }}
            onError={function(msg){toast(msg||"Échec du paiement","error");}}
          />
        )}
        <div style={{padding:"14px 20px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid "+DS.border}}>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:DS.text}}>Réserver</div>
            <div style={{fontSize:11,color:DS.textMuted}}>{e.name}</div>
          </div>
          <button onClick={handleClose} style={{background:DS.card,border:"1px solid "+DS.border,borderRadius:"50%",width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><X size={14} color={DS.textMuted}/></button>
        </div>
        <div style={{padding:"0 20px",display:"flex",gap:4,marginTop:14,marginBottom:4}}>
          {[1,2,3,4].map(function(s){return <div key={s} style={{flex:1,height:3,borderRadius:2,background:s<=step?color:DS.border}}/>;  })}
        </div>
        <div key={step} style={{padding:"14px 20px 28px",animation:"hp-fade-up 0.28s cubic-bezier(0.22,1,0.36,1)"}}>

          {/* ETAPE 1 : Dates + voyageurs/convives */}
          {step===1&&(
            <div>
              <div style={{fontSize:14,fontWeight:800,color:DS.text,marginBottom:14}}>{isRestaurantBooking?"Date et convives":"Dates et voyageurs"}</div>
              {isHotelBooking?(
                <div style={{display:"flex",gap:10,marginBottom:14}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:700,color:DS.textMuted,marginBottom:5}}>{dateLabel}</div>
                    <input type="date" min={_today} value={dateIn} onChange={function(ev){setDateIn(ev.target.value);}} onFocus={function(e){e.target.classList.add("hp-input-focus");}} onBlur={function(e){e.target.classList.remove("hp-input-focus");}} style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"11px 12px",fontSize:13,color:DS.text,outline:"none",boxSizing:"border-box"}}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:700,color:DS.textMuted,marginBottom:5}}>NOMBRE DE NUITS</div>
                    <div style={{display:"flex",alignItems:"center",gap:8,background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"7px 10px"}}>
                      <button onClick={function(){setNightsCount(Math.max(1,nightsCount-1));}} style={{width:26,height:26,borderRadius:"50%",border:"1px solid "+DS.border,background:"transparent",cursor:"pointer",fontSize:15,color:DS.text,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>-</button>
                      <span style={{flex:1,textAlign:"center",fontSize:14,fontWeight:800,color:DS.text}}>{nightsCount}</span>
                      <button onClick={function(){setNightsCount(Math.min(30,nightsCount+1));}} style={{width:26,height:26,borderRadius:"50%",border:"1px solid "+DS.border,background:"transparent",cursor:"pointer",fontSize:15,color:DS.text,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>+</button>
                    </div>
                  </div>
                </div>
              ):(
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11,fontWeight:700,color:DS.textMuted,marginBottom:5}}>{dateLabel}</div>
                  <input type="date" min={_today} value={dateIn} onChange={function(ev){setDateIn(ev.target.value);}} style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"11px 12px",fontSize:13,color:DS.text,outline:"none",boxSizing:"border-box"}}/>
                  <div style={{fontSize:10,color:DS.textDim,marginTop:5}}>Reservation pour une date unique, sans nuitee</div>
                </div>
              )}
              {isHotelBooking&&dateIn&&dateOut&&(
                <div style={{fontSize:11,color:DS.textMuted,marginBottom:10,marginTop:-8}}>Départ prévu le <span style={{color:DS.text,fontWeight:700}}>{dateOut}</span></div>
              )}
              {isHotelBooking&&dateIn&&dateOut&&(
                <div style={{background:DS.primarySoft,border:"1px solid "+DS.primary+"22",borderRadius:10,padding:"9px 14px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:12,color:DS.textMuted,fontWeight:600}}>Nombre de nuits</span>
                  <span style={{fontSize:14,fontWeight:900,color:DS.primary}}>{nights} nuit{nights>1?"s":""}</span>
                </div>
              )}
              <div style={{display:"flex",gap:10,marginBottom:16}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,fontWeight:700,color:DS.textMuted,marginBottom:5}}>{guestsLabel}</div>
                  <div style={{display:"flex",alignItems:"center",gap:10,background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"10px 12px"}}>
                    <button onClick={function(){setGuests(Math.max(1,guests-1));}} style={{width:36,height:36,borderRadius:"50%",border:"1px solid "+DS.border,background:"transparent",cursor:"pointer",fontSize:16,color:DS.text,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>-</button>
                    <span style={{flex:1,textAlign:"center",fontSize:14,fontWeight:800,color:DS.text}}>{guests} pers.</span>
                    <button onClick={function(){setGuests(Math.min(20,guests+1));}} style={{width:36,height:36,borderRadius:"50%",border:"1px solid "+DS.border,background:"transparent",cursor:"pointer",fontSize:16,color:DS.text,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>+</button>
                  </div>
                </div>
                {isHotelBooking&&!isCombo&&(
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:700,color:DS.textMuted,marginBottom:5}}>NOMBRE DE CHAMBRES</div>
                    <div style={{display:"flex",alignItems:"center",gap:10,background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"10px 12px"}}>
                      <button onClick={function(){setRoomCount(Math.max(1,roomCount-1));}} style={{width:36,height:36,borderRadius:"50%",border:"1px solid "+DS.border,background:"transparent",cursor:"pointer",fontSize:16,color:DS.text,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>-</button>
                      <span style={{flex:1,textAlign:"center",fontSize:14,fontWeight:800,color:DS.text}}>{roomCount} chbre{roomCount>1?"s":""}</span>
                      <button onClick={function(){setRoomCount(Math.min(e.selectedRoom&&e.selectedRoom.stock?e.selectedRoom.stock:10,roomCount+1));}} style={{width:36,height:36,borderRadius:"50%",border:"1px solid "+DS.border,background:"transparent",cursor:"pointer",fontSize:16,color:DS.text,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>+</button>
                    </div>
                  </div>
                )}
                {isRestaurantBooking&&(
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:700,color:DS.textMuted,marginBottom:5}}>NOMBRE DE TABLES</div>
                    <div style={{display:"flex",alignItems:"center",gap:10,background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"10px 12px"}}>
                      <button onClick={function(){setTableCount(Math.max(1,tableCount-1));}} style={{width:36,height:36,borderRadius:"50%",border:"1px solid "+DS.border,background:"transparent",cursor:"pointer",fontSize:16,color:DS.text,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>-</button>
                      <span style={{flex:1,textAlign:"center",fontSize:14,fontWeight:800,color:DS.text}}>{tableCount} table{tableCount>1?"s":""}</span>
                      <button onClick={function(){setTableCount(Math.min(10,tableCount+1));}} style={{width:36,height:36,borderRadius:"50%",border:"1px solid "+DS.border,background:"transparent",cursor:"pointer",fontSize:16,color:DS.text,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>+</button>
                    </div>
                  </div>
                )}
              </div>
              {serviceLabel&&(
                <div style={{background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"10px 14px",marginBottom:14}}>
                  <div style={{fontSize:11,color:DS.textMuted,marginBottom:2}}>SERVICE SELECTIONNE</div>
                  <div style={{fontSize:13,fontWeight:700,color:DS.text}}>{serviceLabel}</div>
                  {isCombo&&<div style={{fontSize:11,color:DS.textMuted,marginTop:4}}>{e.comboMeals.length} repas inclus{e.comboTable?" - Table au restaurant":""}</div>}
                </div>
              )}
              <div style={{background:DS.goldSoft,border:"1px solid "+DS.gold+"33",borderRadius:12,padding:"12px 14px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:13,color:DS.textMuted}}>{
                  isCombo?(basePrice+" EUR x "+nights+" nuit"+(nights>1?"s":"")):
                  hasDishes?(e.selectedDishes.length+" plat"+(e.selectedDishes.length>1?"s":"")+(tableCount>1?" x "+tableCount+" tables":"")):
                  isHotelBooking?(basePrice+" EUR x "+nights+" nuit"+(nights>1?"s":"")+(roomCount>1?" x "+roomCount+" chambres":"")):
                  (basePrice+" EUR"+(tableCount>1?" x "+tableCount+" tables":""))
                }</div>
                <div style={{fontSize:22,fontWeight:900,color:DS.gold}}>{totalPrice.toFixed(0)} EUR</div>
              </div>
              <button onClick={function(){if(dateIn)setStep(2);else toast("Sélectionnez une date","error");}} style={{width:"100%",padding:"12px",background:color,border:"none",borderRadius:12,color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer"}}>Continuer</button>
            </div>
          )}

          {/* ETAPE 2 : Paiement avec ou sans */}
          {step===2&&(
            <div>
              <div style={{fontSize:14,fontWeight:800,color:DS.text,marginBottom:6}}>Type de reservation</div>
              <div style={{fontSize:12,color:DS.textMuted,marginBottom:14}}>Choisissez de payer maintenant ou à l'arrivée.</div>
              {[["avec","Reservation avec paiement","Paiement securise maintenant. Confirmation immediate.",DS.success],["sans","Reservation sans paiement","Paiement à l'arrivée. Confirmation sous 24h.",DS.warning]].map(function(_i){
                var v=_i[0];var t=_i[1];var s=_i[2];var col=_i[3];var isSel=payMode===v;
                return(
                  <button key={v} onClick={function(){setPayMode(v);}} style={{width:"100%",display:"flex",alignItems:"flex-start",gap:12,padding:"14px 16px",marginBottom:10,borderRadius:14,border:"2px solid "+(isSel?col+"88":DS.border),background:isSel?col+"0D":DS.card,cursor:"pointer",textAlign:"left"}}>
                    <div style={{width:20,height:20,borderRadius:"50%",border:"2px solid "+(isSel?col:DS.border),background:isSel?col:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
                      {isSel&&<div style={{width:8,height:8,borderRadius:"50%",background:"#fff"}}/>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:800,color:isSel?col:DS.text}}>{t}</div>
                      <div style={{fontSize:11,color:DS.textMuted,marginTop:3,lineHeight:1.4}}>{s}</div>
                      {v==="avec"&&isSel&&<div style={{fontSize:14,fontWeight:900,color:DS.gold,marginTop:6}}>{totalPrice.toFixed(0)} EUR</div>}
                      {v==="sans"&&isSel&&<div style={{fontSize:12,color:DS.textMuted,marginTop:6}}>Reservation sans paiement</div>}
                    </div>
                  </button>
                );
              })}
              {payMode==="avec"&&(
                <div style={{marginTop:8,marginBottom:14}}>
                  <div style={{fontSize:11,fontWeight:700,color:DS.textMuted,marginBottom:8}}>METHODE DE PAIEMENT</div>
                  {[["mobile","Mobile Money","Wave, Orange Money, MTN"],["card","Carte bancaire","Visa, Mastercard, CB"]].map(function(_i){
                    var v=_i[0];var l=_i[1];var sub=_i[2];var isSel=payMethod===v;
                    return(
                      <div key={v} onClick={function(){setPayMethod(v);}} style={{padding:"12px 14px",marginBottom:8,borderRadius:12,border:"1.5px solid "+(isSel?color+"66":DS.border),background:isSel?color+"0C":DS.card,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
                        <div style={{width:20,height:20,borderRadius:"50%",border:"2px solid "+(isSel?color:DS.border),background:isSel?color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          {isSel&&<div style={{width:8,height:8,borderRadius:"50%",background:"#fff"}}/>}
                        </div>
                        <div><div style={{fontSize:13,fontWeight:700,color:DS.text}}>{l}</div><div style={{fontSize:11,color:DS.textMuted}}>{sub}</div></div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <button onClick={function(){setStep(1);}} style={{flex:1,padding:"11px",background:"transparent",border:"1px solid "+DS.border,borderRadius:12,color:DS.textMuted,fontSize:13,cursor:"pointer"}}>Retour</button>
                <button onClick={function(){
                  if(paying) return;
                  // Flux sans paiement ou Mobile Money : simulation conservée
                  if(payMode==="sans"||(payMode==="avec"&&payMethod==="mobile")){
                    setPaying(true);
                    var delay=payMode==="avec"?1100:500;
                    setTimeout(function(){
                      var initStatus=payMode==="avec"?"confirmed":"pending";
                      var resa={id:resaId,clientName:clientName,estab:e.name,estabType:e.type,service:serviceLabel,dateIn:dateIn,dateOut:dateOut,nights:nights,guests:guests,roomCount:isCombo?1:(isHotelBooking?roomCount:null),tableCount:isRestaurantBooking?tableCount:null,total:totalPrice,payMode:payMode,payMethod:payMode==="avec"?payMethod:null,qr:resaId,status:initStatus,isCombo:isCombo,comboMeals:isCombo?e.comboMeals:null,comboTable:isCombo?e.comboTable:null};
                      setPaying(false);
                      setStep(3);
                      toast(payMode==="avec"?"Paiement Mobile Money confirmé !":"Demande envoyée à l'établissement !","success");
                      if(props.onBooked)props.onBooked(BookingService.createBooking(resa,selfUserId));
                    },delay);
                    return;
                  }
                  // Paiement carte → Stripe
                  if(payMode==="avec"&&payMethod==="card"){
                    if(!_stripePromise){toast("Stripe non configuré","error");return;}
                    var _amtCents=Math.round(totalPrice*100);
                    if(!_amtCents||_amtCents<50){toast("Montant invalide pour le paiement","error");return;}
                    setPaying(true);
                    fetch("/api/create-payment-intent",{
                      method:"POST",
                      headers:{"Content-Type":"application/json"},
                      body:JSON.stringify({amount:_amtCents,currency:"eur",resaId:resaId,estabName:e.name})
                    })
                    .then(function(r){return r.json();})
                    .then(function(data){
                      setPaying(false);
                      if(data.error){toast("Erreur paiement : "+data.error,"error");return;}
                      setStripeClientSecret(data.clientSecret);
                      setShowStripeModal(true);
                    })
                    .catch(function(){
                      setPaying(false);
                      toast("Impossible de contacter le service de paiement","error");
                    });
                  }
                }} style={{flex:2,padding:"11px",background:paying?DS.textDim:color,border:"none",borderRadius:12,color:"#fff",fontSize:14,fontWeight:900,cursor:paying?"not-allowed":"pointer",transition:"background .2s",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  {paying?<span style={{display:"inline-block",width:14,height:14,border:"2px solid #fff",borderTopColor:"transparent",borderRadius:"50%",animation:"hp-spin 0.7s linear infinite"}}/>:null}
                  {paying?"Traitement en cours...":(payMode==="avec"?"Payer "+totalPrice.toFixed(0)+" EUR":"Confirmer la reservation")}
                </button>
              </div>
            </div>
          )}

          {/* ETAPE 3 : Ticket QR numerique */}
          {step===3&&(
            <div>
              <div style={{textAlign:"center",marginBottom:20}}>
                <div style={{width:64,height:64,borderRadius:"50%",background:payMode==="avec"?DS.successSoft:DS.warningSoft,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",animation:"hp-bounce-in 0.55s cubic-bezier(0.22,1,0.36,1)"}}>{payMode==="avec"?<CheckCircle size={32} color={DS.success}/>:<Clock size={32} color={DS.warning}/>}</div>
                <div style={{fontSize:17,fontWeight:900,color:payMode==="avec"?DS.success:DS.warning}}>{payMode==="avec"?"Réservation confirmée !":"Demande envoyée !"}</div>
                <div style={{fontSize:12,color:DS.textMuted,marginTop:4}}>{payMode==="avec"?"Votre ticket numérique est prêt":"En attente de confirmation de l'établissement (24h)"}</div>
              </div>
              <div style={{background:DS.card,border:"1px solid "+DS.border,borderRadius:16,overflow:"hidden",marginBottom:16}}>
                <div style={{background:color+"18",padding:"14px 16px",borderBottom:"1px solid "+DS.border+"40"}}>
                  <div style={{fontSize:16,fontWeight:900,color:DS.text}}>{e.name}</div>
                  <div style={{fontSize:11,color:DS.textMuted}}>{e.location}</div>
                </div>
                <div style={{padding:"16px 16px 8px"}}>
                  {(isRestaurantBooking?[
                    ["Service",serviceLabel],
                    ["Convives",guests+" personne"+(guests>1?"s":"")],
                    ["Tables",tableCount+" table"+(tableCount>1?"s":"")],
                    ["Date",dateIn||"À confirmer"],
                    ["Paiement",payMode==="avec"?totalPrice.toFixed(0)+" EUR":"Reservation sans paiement"],
                    ["Reference",resaId],
                  ]:[
                    ["Service",serviceLabel],
                    ["Voyageurs",guests+" personne"+(guests>1?"s":"")],
                    ["Arrivee",dateIn||"À confirmer"],
                    ["Depart",dateOut||"À confirmer"],
                    ["Duree",nights+" nuit"+(nights>1?"s":"")],
                    ["Paiement",payMode==="avec"?totalPrice.toFixed(0)+" EUR":"Reservation sans paiement"],
                    ["Reference",resaId],
                  ]).map(function(_i){var k=_i[0];var v=_i[1];return(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid "+DS.border+"20"}}>
                      <span style={{fontSize:12,color:DS.textMuted}}>{k}</span>
                      <span style={{fontSize:12,fontWeight:700,color:k==="Paiement"?DS.gold:k==="Reference"?DS.primary:DS.text}}>{v}</span>
                    </div>
                  );})}
                </div>
                <div style={{padding:"16px",textAlign:"center",borderTop:"1px solid "+DS.border+"40"}}>
                  <div style={{fontSize:10,color:DS.textMuted,marginBottom:10}}>CODE QR · À PRÉSENTER À L'ÉTABLISSEMENT</div>
                  <div style={{margin:"0 auto"}}><QRTicket id={resaId} sz={120}/></div>
                  <div style={{fontSize:10,color:DS.textMuted,marginTop:8,fontFamily:"monospace"}}>{resaId}</div>
                </div>
              </div>
              <div style={{background:DS.successSoft,border:"1px solid "+DS.success+"33",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:11,color:DS.success,lineHeight:1.5,display:"flex",alignItems:"center",gap:8}}>
                <CheckCircle size={13} color={DS.success}/>{isRestaurantBooking?"Ce ticket est valide jusqu'à votre arrivée. L'établissement scannera votre QR code.":"Ce ticket est valide jusqu'à votre arrivée. L'établissement scannera votre QR code pour confirmer."}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={function(){setStep(4);}} style={{flex:1,padding:"11px",background:DS.primarySoft,border:"1px solid "+DS.primary+"33",borderRadius:12,color:DS.primary,fontSize:12,fontWeight:700,cursor:"pointer"}}>Voir le ticket</button>
                <button onClick={onClose} style={{flex:1,padding:"11px",background:color,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer"}}>Fermer</button>
              </div>
            </div>
          )}

          {/* ETAPE 4 : Ticket detail complet */}
          {step===4&&(
            <div>
              <div style={{fontSize:14,fontWeight:800,color:DS.text,marginBottom:14}}>Ticket de réservation</div>
              <div style={{background:DS.card,border:"2px solid "+color+"44",borderRadius:16,overflow:"hidden",marginBottom:16}}>
                <div style={{background:color,padding:"16px",textAlign:"center"}}>
                  <div style={{fontSize:11,fontWeight:800,color:"rgba(255,255,255,.7)",letterSpacing:2}}>HOTELPLATFORM TRAVEL</div>
                  <div style={{fontSize:18,fontWeight:900,color:"#fff",marginTop:4}}>{e.name}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.8)",marginTop:2}}>{e.location}</div>
                </div>
                <div style={{padding:"16px"}}>
                  {(isRestaurantBooking?[
                    ["Type","service",serviceLabel,DS.text],
                    ["Convives","guests",guests+" pers.",DS.text],
                    ["Tables","tables",tableCount+" table"+(tableCount>1?"s":""),DS.text],
                    ["Date","date",dateIn||"À confirmer",DS.primary],
                    ["Montant","price",payMode==="avec"?totalPrice.toFixed(0)+" EUR":"Reservation sans paiement",payMode==="avec"?DS.gold:DS.success],
                  ]:[
                    ["Type","service",serviceLabel,DS.text],
                    ["Voyageurs","guests",guests+" pers.",DS.text],
                    ["Arrivee","in",dateIn||"À confirmer",DS.primary],
                    ["Depart","out",dateOut||"À confirmer",DS.primary],
                    ["Nuits","nights",nights+" nuit"+(nights>1?"s":""),DS.text],
                    ["Montant","price",payMode==="avec"?totalPrice.toFixed(0)+" EUR":"Reservation sans paiement",payMode==="avec"?DS.gold:DS.success],
                  ]).map(function(_i){var k=_i[0];var id=_i[1];var v=_i[2];var col=_i[3];return(
                    <div key={id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid "+DS.border+"20"}}>
                      <span style={{fontSize:12,color:DS.textMuted,fontWeight:600}}>{k}</span>
                      <span style={{fontSize:13,fontWeight:800,color:col}}>{v}</span>
                    </div>
                  );})}
                </div>
                <div style={{textAlign:"center",padding:"16px",borderTop:"1px solid "+DS.border+"30",background:DS.surface}}>
                  <QRTicket id={resaId} sz={100}/>
                  <div style={{fontSize:10,color:DS.textMuted,marginTop:8,fontFamily:"monospace",letterSpacing:1}}>{resaId}</div>
                  <div style={{fontSize:10,color:DS.textDim,marginTop:4}}>Valide jusqu'au scannage de l'établissement</div>
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={function(){setStep(3);}} style={{flex:1,padding:"12px",background:"transparent",border:"1px solid "+DS.border,borderRadius:12,color:DS.textMuted,fontSize:12,cursor:"pointer"}}>Retour</button>
                <button onClick={onClose} style={{flex:2,padding:"12px",background:color,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:900,cursor:"pointer"}}>Fermer</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function ProFeed(props){
  var proType=props.proType;var isPremium=props.isPremium||false;var onPremium=props.onPremium;var onProfile=props.onProfile;var onAddNotif=props.onAddNotif||null;
  // Fix #3 : data declare en premier pour eviter crash dans addCmt
  var color=rC(proType);
  var _allData=proType==="hotel"?DataLayer.getHotels():DataLayer.getRestaurants();
  var selfEmail=props.selfEmail||"";
  var selfUserId=props.selfUserId||null;
  var data=(selfUserId&&_allData.find(function(h){return h.userId===selfUserId;}))||(_allData.length>0?_allData[0]:{name:selfEmail.split("@")[0]||"Pro",verified:false,followers:0,rating:0,reviewCount:0});
  // Fix #6 : localStorage pour likes et favs
  var _initPro=useRef(null);
  if(!_initPro.current){var _lkP={};var _fvP=[];try{_lkP=JSON.parse(localStorage.getItem("hp_pro_likes")||"{}");_fvP=JSON.parse(localStorage.getItem("hp_pro_favs")||"[]");}catch(e){}_initPro.current={likes:_lkP,favs:_fvP};}
  var _initLikesPro=_initPro.current.likes;var _initFavsPro=_initPro.current.favs;
  var s1=useState(DataLayer.getFeed().map(function(p){return Object.assign({},p,{liked:!!_initLikesPro[p.id],likes:p.likes+(_initLikesPro[p.id]?1:0),comments:[],showCmt:false});}));
  var posts=s1[0];var setPosts=s1[1];
  var sShare=useState(null);var sharePost=sShare[0];var setSharePost=sShare[1];
  var s2=useState("");var newPost=s2[0];var setNewPost=s2[1];
  var s3=useState(false);var showNew=s3[0];var setShowNew=s3[1];
  var scm2=useState({});var cmtText=scm2[0];var setCmtText=scm2[1];
  var tk=useToast();var toast=tk.show;var Toast=tk.Toast;
  function addCmt(id,replyTo){
    var text=sanitizeText(cmtText[id]||"",500);if(!text)return;
    var cm={id:Date.now(),author:data.name,text:text,time:"maintenant",replyTo:replyTo?("@"+replyTo.author+" : "+replyTo.text.slice(0,40)+(replyTo.text.length>40?"…":"")):null};
    setPosts(function(ps){return ps.map(function(p){return p.id===id?Object.assign({},p,{comments:p.comments.concat([cm])}):p;});});
    var nc=Object.assign({},cmtText);nc[id]="";setCmtText(nc);
    try{if(DataLayer._client&&selfUserId){DataLayer._client.from("post_comments").insert([{post_id:id,user_id:selfUserId,author:data.name,body:text}]).then(function(){}).catch(function(){});}}catch(e){}
    toast("Commentaire publié","neutral");
  }
  function delCmt(postId,cmId){
    setPosts(function(ps){return ps.map(function(p){return p.id===postId?Object.assign({},p,{comments:p.comments.filter(function(cm){return cm.id!==cmId;})}):p;});});
    try{if(DataLayer._client)DataLayer._client.from("post_comments").delete().eq("id",String(cmId)).then(function(){}).catch(function(){});}catch(e){}
    toast("Commentaire supprimé","neutral");
  }
  var sm=useState(null);var menuOpen=sm[0];var setMenuOpen=sm[1];
  var sf=useState(_initFavsPro);var favPosts=sf[0];var setFavPosts=sf[1];
  var sr=useState(null);var reportTarget=sr[0];var setReportTarget=sr[1];
  // Fix #2 : toast favoris dans le bon sens
  function toggleFav(id){
    var wasFav=favPosts.indexOf(id)>=0;
    setFavPosts(function(f){var next=wasFav?f.filter(function(x){return x!==id;}):f.concat([id]);try{localStorage.setItem("hp_pro_favs",JSON.stringify(next));}catch(e){}return next;});
    setMenuOpen(null);
    toast(wasFav?"Retiré des favoris":"Ajouté aux favoris","success");
  }
  function openReport(post){setMenuOpen(null);setReportTarget(post);}
  var followingPosts=props.followingIds||[];
  function toggleFollowPost(id){if(props.onToggleFollow)props.onToggleFollow(id);}
  function toggleLike(id){setPosts(function(ps){return ps.map(function(p){return p.id===id?Object.assign({},p,{liked:!p.liked,likes:p.liked?p.likes-1:p.likes+1}):p;});});}
  var sLoadPro=useState(true);var loadingPro=sLoadPro[0];var setLoadingPro=sLoadPro[1];
  useEffect(function(){var t=setTimeout(function(){setLoadingPro(false);},350);return function(){clearTimeout(t);};},[]);
  var sHeartPro=useState(null);var heartAnimPro=sHeartPro[0];var setHeartAnimPro=sHeartPro[1];
  function triggerHeartPro(id){setHeartAnimPro(id);setTimeout(function(){setHeartAnimPro(null);},500);}
  function toggleLikePro(id){
    var post=posts.find(function(p){return p.id===id;});var wasLiked=post?post.liked:false;
    setPosts(function(ps){
      var next=ps.map(function(p){return p.id===id?Object.assign({},p,{liked:!p.liked,likes:p.liked?p.likes-1:p.likes+1}):p;});
      try{var lk={};next.forEach(function(p){if(p.liked)lk[p.id]=1;});localStorage.setItem("hp_pro_likes",JSON.stringify(lk));}catch(e){}
      if(!wasLiked&&post&&onAddNotif){onAddNotif({id:"notif_like_"+id+"_"+Date.now(),icon:"Heart",color:DS.error,title:"Nouveau like",body:"Quelqu'un a aimé votre publication.",time:"maintenant",read:false,tab:"feed",prefKey:"follow"});}
      return next;
    });
    try{
      if(DataLayer._client&&selfUserId){
        if(!wasLiked){DataLayer._client.from("post_likes").insert([{user_id:selfUserId,post_id:id}]).then(function(){}).catch(function(){});}
        else{DataLayer._client.from("post_likes").delete().eq("post_id",id).eq("user_id",selfUserId).then(function(){}).catch(function(){});}
      }
    }catch(e){}
  }
  function toggleCmt(id){setPosts(function(ps){return ps.map(function(p){return p.id===id?Object.assign({},p,{showCmt:!p.showCmt}):p;});});}
  function doShare(id){var p=null;for(var k=0;k<posts.length;k++){if(posts[k].id===id){p=posts[k];break;}}setSharePost(p);}
  function confirmShare(id){setPosts(function(ps){return ps.map(function(p){return p.id===id?Object.assign({},p,{shares:(p.shares||0)+1}):p;});});toast("Partagé avec succès","success");}
  var smedia=useState(null);var mediaPreview=smedia[0];var setMediaPreview=smedia[1];
  var smtype=useState(null);var mediaType=smtype[0];var setMediaType=smtype[1];
  var smfile=useState(null);var mediaFile=smfile[0];var setMediaFile=smfile[1];
  var sgate=useState(false);var showVideoGate=sgate[0];var setShowVideoGate=sgate[1];
  function pickMedia(ev){
    var file=ev.target.files&&ev.target.files[0];if(!file)return;
    var isVideo=file.type.indexOf("video")===0;
    if(isVideo&&!isPremium){setShowVideoGate(true);ev.target.value="";return;}
    var url=URL.createObjectURL(file);
    setMediaPreview(url);setMediaType(isVideo?"video":"image");setMediaFile(file);
    ev.target.value="";
  }
  function removeMedia(){setMediaPreview(null);setMediaType(null);setMediaFile(null);}
  function publish(){
    var _cleanPost=sanitizeText(newPost,2000);
    if(!_cleanPost&&!mediaPreview)return;
    var newId="post-"+Date.now();
    var _doPublish=function(mediaUrl){
      var newObj={id:newId,author:data.name,type:proType,time:"maintenant",text:_cleanPost,img:mediaType==="image"?mediaUrl:null,video:mediaType==="video"?mediaUrl:null,likes:0,comments:[],showCmt:false,verified:data.verified};
      setPosts(function(ps){return [newObj].concat(ps);});
      try{var _pp=JSON.parse(localStorage.getItem("hp_pro_posts")||"[]");localStorage.setItem("hp_pro_posts",JSON.stringify([newObj].concat(_pp).slice(0,30)));}catch(_e){}
      try{DataLayer.create("posts",[{id:newId,author:data.name,type:proType,data:newObj}]).catch(function(){});}catch(e){}
      setNewPost("");setShowNew(false);setMediaPreview(null);setMediaType(null);setMediaFile(null);
      toast("Publication publiée avec succès","success");
    };
    if(mediaFile&&DataLayer._client){
      var ext=mediaFile.name.split(".").pop()||"jpg";
      var path="posts/"+newId+"."+ext;
      DataLayer._client.storage.from("media").upload(path,mediaFile,{contentType:mediaFile.type,upsert:false})
        .then(function(res){
          if(res.data){
            var pub=DataLayer._client.storage.from("media").getPublicUrl(path);
            _doPublish(pub.data.publicUrl);
          } else {
            _doPublish(mediaPreview);
          }
        }).catch(function(){_doPublish(mediaPreview);});
    } else {
      _doPublish(mediaPreview);
    }
  }
  return(
    <div style={{background:DS.bg,paddingBottom:24}}>
      <Toast/>
      {reportTarget&&<ReportM targetName={"la publication de "+reportTarget.author} targetId={reportTarget.id} reporterId={selfUserId} onClose={function(){setReportTarget(null);}} onSubmit={function(){setReportTarget(null);toast("Signalement envoyé · Merci pour votre contribution","success");}}/>}
      {menuOpen&&<div onClick={function(){setMenuOpen(null);}} style={{position:"fixed",inset:0,zIndex:199}}/>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",background:DS.surface,borderBottom:"1px solid "+DS.border,marginBottom:10}}>
        {[[fmtK(data.followers),"Abonnés",color],[data.rating+" ★","Note",DS.gold],[fmtK(data.reviewCount),"Avis",DS.success]].map(function(_i,i){var v=_i[0];var l=_i[1];var col=_i[2];return <div key={i} style={{padding:"14px 4px",textAlign:"center",borderRight:i<2?"1px solid "+DS.border:"none"}}><div style={{fontSize:20,fontWeight:900,color:col}}>{v}</div><div style={{fontSize:10,color:DS.textMuted,marginTop:2}}>{l}</div></div>;})}
      </div>
      <div style={{background:DS.surface,borderBottom:"1px solid "+DS.border+"40",padding:"14px 16px",marginBottom:10}}>
        {!showNew
          ? <button onClick={function(){setShowNew(true);}} style={{display:"flex",alignItems:"center",gap:12,width:"100%",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
              <Av sz={46} letter={data.name[0]} verified={data.verified}/>
              <div style={{flex:1,padding:"11px 16px",border:"1px solid "+DS.border,borderRadius:28,fontSize:14,color:DS.textMuted,background:DS.card}}>Publier une mise à jour...</div>
            </button>
          : <div>
              <div style={{display:"flex",gap:12,marginBottom:12}}>
                <Av sz={46} letter={data.name[0]} verified={data.verified}/>
                <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:DS.text}}>{data.name}</div><div style={{fontSize:11,color:DS.textMuted}}>Publier maintenant</div></div>
              </div>
              <textarea value={newPost} onChange={function(e){setNewPost(e.target.value);}} placeholder="Partagez une actualité, une offre..." rows={4} style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:14,padding:"14px 16px",fontSize:15,color:DS.text,outline:"none",resize:"none",lineHeight:1.6,boxSizing:"border-box"}}/>
              {mediaPreview&&(
                <div style={{position:"relative",marginTop:10,borderRadius:14,overflow:"hidden",border:"1px solid "+DS.border}}>
                  {mediaType==="video"
                    ? <video src={mediaPreview} controls style={{width:"100%",maxHeight:280,display:"block",background:"#000"}}/>
                    : <img src={mediaPreview} alt="" style={{width:"100%",maxHeight:280,objectFit:"cover",display:"block"}}/>
                  }
                  <button onClick={removeMedia} style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,.6)",border:"none",borderRadius:"50%",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><X size={14} color="#fff"/></button>
                  {mediaType==="video"&&<div style={{position:"absolute",top:8,left:8,background:DS.gold,borderRadius:8,padding:"2px 8px"}}><span style={{fontSize:9,color:"#000",fontWeight:800}}>VIDEO PREMIUM</span></div>}
                </div>
              )}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10}}>
                <label style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",background:DS.card,border:"1px solid "+DS.border,borderRadius:20,cursor:"pointer"}}>
                  <input type="file" accept="image/*,video/*" onChange={pickMedia} style={{display:"none"}}/>
                  <Camera size={14} color={color}/>
                  <span style={{fontSize:12,color:DS.textMuted,fontWeight:600}}>Photo / Vidéo</span>
                  {!isPremium&&<span style={{fontSize:9,color:DS.gold,fontWeight:800,marginLeft:2}}>(video = Premium)</span>}
                </label>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={function(){setShowNew(false);setNewPost("");removeMedia();}} style={{padding:"9px 20px",background:"transparent",border:"1px solid "+DS.border,borderRadius:20,color:DS.textMuted,fontSize:13,cursor:"pointer"}}>Annuler</button>
                  <button onClick={publish} style={{padding:"9px 24px",background:color,border:"none",borderRadius:20,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Publier</button>
                </div>
              </div>
            </div>
        }
      </div>
      {showVideoGate&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.9)",zIndex:1400,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div style={{width:"100%",maxWidth:420,background:DS.surface,borderRadius:"22px 22px 0 0",border:"1px solid "+DS.border,animation:"hp-slide-up 0.3s ease"}}>
            <div style={{padding:24,textAlign:"center"}}>
              <div style={{width:64,height:64,borderRadius:"50%",background:DS.goldSoft,border:"2px solid "+DS.gold,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><Lock size={28} color={DS.gold}/></div>
              <div style={{fontSize:17,fontWeight:800,color:DS.text,marginBottom:8}}>Video reservee aux comptes Premium</div>
              <div style={{fontSize:13,color:DS.textMuted,lineHeight:1.6,marginBottom:20}}>Les comptes Free peuvent publier du texte et des images. Passez Premium pour publier des videos illimitees.</div>
              <div style={{background:DS.goldSoft,border:"1px solid "+DS.gold+"33",borderRadius:12,padding:"12px 16px",marginBottom:20,textAlign:"left"}}>
                {["Publications video illimitees","Sans publicité","Éligible badge vérification","Visibilite boostee"].map(function(f,i){return <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:i<3?8:0}}><CheckCircle size={13} color={DS.gold}/><span style={{fontSize:12,color:DS.textMuted}}>{f}</span></div>;})}
              </div>
              <button onClick={function(){setShowVideoGate(false);if(onPremium)onPremium();}} style={{width:"100%",padding:"12px",background:DS.gold,border:"none",borderRadius:12,color:"#000",fontSize:14,fontWeight:900,cursor:"pointer",marginBottom:10}}>Passer Premium</button>
              <button onClick={function(){setShowVideoGate(false);}} style={{width:"100%",padding:"10px",background:"transparent",border:"none",color:DS.textMuted,fontSize:12,cursor:"pointer"}}>Annuler</button>
            </div>
          </div>
        </div>
      )}
      {loadingPro&&<FeedSkeleton/>}
      {posts.length===0&&<Emp Icon={FileText} title="Aucune publication" sub="Vos publications apparaîtront ici"/>}
      {posts.map(function(post,_pfi){
        var pc=rC(post.type);
        return(
          <div key={post.id} style={{background:DS.surface,marginBottom:10,borderTop:"1px solid "+DS.border+"28",borderBottom:"1px solid "+DS.border+"28",animation:"hp-item-in 0.34s ease both",animationDelay:(_pfi*50)+"ms"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12,padding:"18px 16px 14px"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12,flex:1,minWidth:0}}>
                <div onClick={function(){if(onProfile)onProfile(post.id,post.type);}} style={{cursor:onProfile?"pointer":"default",flexShrink:0}}>
                  <Av sz={52} letter={post.author[0]} img={function(){var _pe=DataLayer.getEstablishmentById(post.id);return _pe?_pe.img:null;}()} verified={post.verified}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div onClick={function(){if(onProfile)onProfile(post.id,post.type);}} style={{fontSize:15,fontWeight:800,color:DS.text,lineHeight:1.3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",cursor:onProfile?"pointer":"default",display:"inline-block",maxWidth:"100%"}}>{post.author}</div>
                  <div style={{display:"flex",flexWrap:"nowrap",alignItems:"center",gap:5,marginTop:2,overflow:"hidden"}}>
                    <span style={{fontSize:12,color:pc,fontWeight:700,flexShrink:0,whiteSpace:"nowrap"}}>{post.type==="hotel"?"Hôtel":"Restaurant"}</span>
                    {post.combined&&<span style={{fontSize:9,color:DS.primary,fontWeight:800,background:DS.primarySoft,borderRadius:8,padding:"1px 6px",flexShrink:0,whiteSpace:"nowrap"}}>+ Restaurant</span>}
                    <span style={{fontSize:12,color:DS.textMuted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0}}>{post.followers?"- "+fmtK(post.followers)+" abonnés":""}</span>
                    <span onClick={function(ev){ev.stopPropagation();toggleFollowPost(post.id);}} style={{fontSize:12,fontWeight:800,color:followingPosts.indexOf(post.id)>=0?DS.textMuted:pc,cursor:"pointer",flexShrink:0,whiteSpace:"nowrap"}}>- {followingPosts.indexOf(post.id)>=0?"Suivi":"Suivre"}</span>
                  </div>
                  <div style={{fontSize:11,color:DS.textDim,marginTop:3}}>{post.time}</div>
                </div>
              </div>
              <div style={{position:"relative"}}>
                <button onClick={function(ev){ev.stopPropagation();setMenuOpen(menuOpen===post.id?null:post.id);}} style={{background:"none",border:"none",cursor:"pointer",padding:"4px 6px",borderRadius:8,display:"flex",alignItems:"center"}}><MoreVertical size={18} color={DS.textMuted}/></button>
                {menuOpen===post.id&&(
                  <div style={{position:"absolute",top:"100%",right:0,background:DS.card,border:"1px solid "+DS.border,borderRadius:12,padding:"6px 0",minWidth:160,zIndex:200,boxShadow:"0 8px 24px rgba(0,0,0,.4)"}}>
                    <button onClick={function(){toggleFav(post.id);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",cursor:"pointer",textAlign:"left",fontSize:13,color:DS.text,display:"flex",alignItems:"center",gap:8}}>
                      <Bookmark size={14} color={favPosts.indexOf(post.id)>=0?DS.gold:DS.textMuted} fill={favPosts.indexOf(post.id)>=0?DS.gold:"none"}/>
                      {favPosts.indexOf(post.id)>=0?"Retirer des favoris":"Ajouter aux favoris"}
                    </button>
                    <button onClick={function(){openReport(post);}} style={{width:"100%",padding:"10px 16px",background:"none",border:"none",cursor:"pointer",textAlign:"left",fontSize:13,color:DS.error,display:"flex",alignItems:"center",gap:8}}>
                      <Flag size={14} color={DS.error}/>Signaler ce contenu
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div style={{padding:"0 16px 16px",fontSize:15,color:DS.text,lineHeight:1.7}}>{post.text}</div>
            {post.img&&<img src={post.img} alt="" className="hp-img" onLoad={function(e){e.target.classList.add("hp-img-loaded");}} onError={function(e){e.target.style.display="none";}} style={{width:"100%",minHeight:380,maxHeight:620,objectFit:"cover",display:"block"}}/>}{post.video&&<video src={post.video} controls style={{width:"100%",maxHeight:620,display:"block",background:"#000"}}/>}
            <div style={{display:"flex",justifyContent:"space-between",padding:"12px 16px 2px",fontSize:12,color:DS.textDim}}>
              <span>{post.likes} réaction{post.likes!==1?"s":""}</span>
              <span style={{cursor:"pointer"}} onClick={function(){toggleCmt(post.id);}}>{post.comments.length} commentaire{post.comments.length!==1?"s":""}</span><span>{post.shares||0} partage{(post.shares||0)!==1?"s":""}</span>
            </div>
            <div style={{display:"flex",borderTop:"1px solid "+DS.border+"30",marginTop:8}}>
              {[["Liker",Heart,post.liked?DS.error:DS.textMuted,function(){toggleLikePro(post.id);triggerHeartPro(post.id);}],["Commenter",MessageCircle,DS.textMuted,function(){toggleCmt(post.id);}],["Partager",Share2,DS.textMuted,function(){doShare(post.id);}]].map(function(_i){
                var lb=_i[0];var Icon=_i[1];var col=_i[2];var fn=_i[3];
                return(
                  <button key={lb} onClick={fn} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"13px 0",background:"none",border:"none",cursor:"pointer",color:col,fontSize:13}}>
                    <Icon size={20} fill={lb==="Liker"&&post.liked?DS.error:"none"} color={col} style={lb==="Liker"&&heartAnimPro===post.id?{animation:"hp-heart-pop .5s cubic-bezier(0.22,1,0.36,1)"}:{}}/>{lb}
                  </button>
                );
              })}
            </div>
            {post.showCmt&&(
              <CommentsSheet post={post} cmtText={cmtText} setCmtText={setCmtText} addCmt={addCmt} delCmt={delCmt} selfLetter={data.name[0]} selfName={data.name} onAddNotif={onAddNotif} onClose={function(){toggleCmt(post.id);}}/>
            )}
          </div>
        );
      })}
    {sharePost&&<ShareSheet post={sharePost} onClose={function(){setSharePost(null);}} onShared={function(){confirmShare(sharePost.id);}}/>}
    </div>
  );
}

// == ReportM : procedure complete de signalement de contenu ==
function ReportM(props){
  var onClose=props.onClose;var onSubmit=props.onSubmit;var targetName=props.targetName||"ce contenu";
  var targetId=props.targetId||null;var reporterId=props.reporterId||null;
  var s1=useState(1);var step=s1[0];var setStep=s1[1];
  var s2=useState(null);var reason=s2[0];var setReason=s2[1];
  var s3=useState("");var details=s3[0];var setDetails=s3[1];
  var REASONS=[
    ["spam","Spam ou contenu trompeur"],
    ["inappropriate","Contenu inapproprié ou choquant"],
    ["fake","Fausse information"],
    ["abuse","Comportement abusif ou harcèlement"],
    ["scam","Escroquerie ou arnaque"],
    ["other","Autre raison"],
  ];
  function submit(){
    var report={id:"rpt"+Date.now(),target:targetName,reason:reason,details:details,date:new Date().toISOString()};
    try{var existing=JSON.parse(localStorage.getItem("hp_reports")||"[]");localStorage.setItem("hp_reports",JSON.stringify(existing.concat([report])));}catch(ex){}
    try{if(DataLayer._client&&reporterId){DataLayer._client.from("reports").insert([{reporter_id:reporterId,target_id:targetId||targetName,target_type:"post",reason:reason+(details?(" : "+details):""),}]).then(function(){}).catch(function(){});}}catch(ex2){}
    if(onSubmit)onSubmit(reason,details);setStep(3);
  }
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.9)",zIndex:1400,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:420,background:DS.surface,borderRadius:"22px 22px 0 0",border:"1px solid "+DS.border,maxHeight:"88vh",overflowY:"auto",WebkitOverflowScrolling:"touch",touchAction:"pan-y",animation:"hp-slide-up 0.3s ease"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid "+DS.border,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:DS.text}}>Signaler {targetName}</div>
            <div style={{fontSize:11,color:DS.textMuted,marginTop:2}}>Votre signalement reste confidentiel</div>
          </div>
          <button onClick={onClose} style={{background:DS.card,border:"1px solid "+DS.border,borderRadius:"50%",width:44,height:44,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={14} color={DS.textMuted}/></button>
        </div>
        <div style={{padding:20}}>
          {step===1&&(
            <div>
              <div style={{fontSize:13,fontWeight:700,color:DS.text,marginBottom:12}}>Pourquoi signalez-vous ce contenu ?</div>
              {REASONS.map(function(_i){
                var rv=_i[0];var rl=_i[1];var isSel=reason===rv;
                return(
                  <button key={rv} onClick={function(){setReason(rv);}} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"12px 14px",marginBottom:8,borderRadius:12,border:"1.5px solid "+(isSel?DS.error+"66":DS.border),background:isSel?DS.error+"0D":DS.card,cursor:"pointer",textAlign:"left"}}>
                    <div style={{width:18,height:18,borderRadius:"50%",border:"2px solid "+(isSel?DS.error:DS.border),background:isSel?DS.error:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {isSel&&<div style={{width:7,height:7,borderRadius:"50%",background:"#fff"}}/>}
                    </div>
                    <span style={{fontSize:13,color:isSel?DS.error:DS.text,fontWeight:isSel?700:400}}>{rl}</span>
                  </button>
                );
              })}
              <button onClick={function(){if(reason)setStep(2);}} disabled={!reason} style={{width:"100%",padding:"12px",marginTop:8,background:reason?DS.error:DS.textDim,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:reason?"pointer":"not-allowed",opacity:reason?1:.6}}>Continuer</button>
            </div>
          )}
          {step===2&&(
            <div>
              <div style={{fontSize:13,fontWeight:700,color:DS.text,marginBottom:6}}>Détails supplémentaires (facultatif)</div>
              <div style={{fontSize:11,color:DS.textMuted,marginBottom:12}}>Aidez-nous à mieux comprendre le problème.</div>
              <textarea value={details} onChange={function(e){setDetails(e.target.value);}} placeholder="Décrivez le problème..." rows={4} style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"11px 14px",fontSize:13,color:DS.text,outline:"none",resize:"none",lineHeight:1.5,boxSizing:"border-box",marginBottom:16}}/>
              <div style={{background:DS.warningSoft,border:"1px solid "+DS.warning+"33",borderRadius:10,padding:"10px 14px",marginBottom:18,fontSize:11,color:DS.warning,lineHeight:1.5}}>
                Les faux signalements répétés peuvent entrainer des restrictions sur votre compte.
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={function(){setStep(1);}} style={{flex:1,padding:"11px",background:"transparent",border:"1px solid "+DS.border,borderRadius:12,color:DS.textMuted,fontSize:13,cursor:"pointer"}}>Retour</button>
                <button onClick={submit} style={{flex:2,padding:"11px",background:DS.error,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer"}}>Envoyer le signalement</button>
              </div>
            </div>
          )}
          {step===3&&(
            <div style={{textAlign:"center",paddingTop:8,paddingBottom:10}}>
              <div style={{width:64,height:64,borderRadius:"50%",background:DS.successSoft,border:"2px solid "+DS.success,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><CheckCircle size={30} color={DS.success}/></div>
              <div style={{fontSize:16,fontWeight:800,color:DS.success,marginBottom:8}}>Signalement envoyé</div>
              <div style={{fontSize:13,color:DS.textMuted,lineHeight:1.6,marginBottom:20}}>Notre équipe de modération va examiner ce contenu sous 24-48h. Merci de contribuer à la sécurité de la communauté.</div>
              <button onClick={onClose} style={{width:"100%",padding:"11px",background:DS.primary,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer"}}>Fermer</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// == ServiceConfigModal : creation / edition d un service ==
function ServiceConfigModal(props){
  var onClose=props.onClose;var onSave=props.onSave;
  var initial=props.initial||null;var mode=props.mode||"room";var color=props.color||DS.primary;
  var isRoom=mode==="room";
  var s1=useState(initial?initial.name:"");var name=s1[0];var setName=s1[1];
  var s2=useState(initial?String(initial.price):"");var price=s2[0];var setPrice=s2[1];
  var s3=useState(initial?initial.description||"":"");var desc=s3[0];var setDesc=s3[1];
  var s4=useState(initial&&initial.capacity?initial.capacity:2);var capacity=s4[0];var setCapacity=s4[1];
  var s5=useState(initial?initial.category||"":"");var cat=s5[0];var setCat=s5[1];
  var s6=useState(initial?initial.available!==false:true);var avail=s6[0];var setAvail=s6[1];
  var s7=useState(initial?initial.options||"":"");var opts=s7[0];var setOpts=s7[1];
  var s8=useState(initial&&initial.stock?initial.stock:5);var stock=s8[0];var setStock=s8[1];
  var CAT_ROOM=["Standard","Supérieure","Deluxe","Suite","Bungalow"];
  var CAT_DISH=["Entree","Plat","Dessert","Boisson","Menu"];
  var cats=isRoom?CAT_ROOM:CAT_DISH;
  function save(){
    if(!name.trim()||!price)return;
    var item=Object.assign({},initial||{},{
      id:initial?initial.id:"s"+Date.now(),
      name:name.trim(),price:parseFloat(price)||0,
      description:desc,category:cat,available:avail
    });
    if(isRoom){item.capacity=Number(capacity);item.stock=Number(stock);}
    if(opts.trim())item.options=opts.trim();
    onSave(item);onClose();
  }
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:1400,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:420,background:DS.surface,borderRadius:"22px 22px 0 0",border:"1px solid "+DS.border,maxHeight:"92vh",overflowY:"auto",WebkitOverflowScrolling:"touch",touchAction:"pan-y",animation:"hp-slide-up 0.3s ease"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid "+DS.border,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:DS.text}}>{initial?"Modifier":"Ajouter"} {isRoom?"une chambre":"un plat"}</div>
            <div style={{fontSize:11,color:DS.textMuted,marginTop:2}}>{isRoom?"Hotel":"Restaurant"} - Gestion des services</div>
          </div>
          <button onClick={onClose} style={{background:DS.card,border:"1px solid "+DS.border,borderRadius:"50%",width:44,height:44,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={14} color={DS.textMuted}/></button>
        </div>
        <div style={{padding:20}}>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:DS.textMuted,marginBottom:5}}>{isRoom?"NOM DE LA CHAMBRE":"NOM DU PLAT"}</div>
            <input value={name} onChange={function(e){setName(e.target.value);}} placeholder={isRoom?"Ex: Suite Présidentielle":"Ex: Thiéboudienne Royal"} style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"11px 14px",fontSize:13,color:DS.text,outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"flex",gap:10,marginBottom:12}}>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:700,color:DS.textMuted,marginBottom:5}}>{isRoom?"PRIX / NUIT (EUR)":"PRIX (EUR)"}</div>
              <input type="number" value={price} onChange={function(e){setPrice(e.target.value);}} placeholder="0" min="0" style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"11px 14px",fontSize:14,fontWeight:700,color:DS.gold,outline:"none",boxSizing:"border-box"}}/>
            </div>
            {isRoom&&<div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:700,color:DS.textMuted,marginBottom:5}}>CAPACITE (PERS.)</div>
              <div style={{display:"flex",alignItems:"center",gap:10,background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"8px 14px"}}>
                <button onClick={function(){setCapacity(Math.max(1,Number(capacity)-1));}} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:DS.text,lineHeight:1}}>-</button>
                <span style={{flex:1,textAlign:"center",fontSize:15,fontWeight:700,color:DS.text}}>{capacity}</span>
                <button onClick={function(){setCapacity(Number(capacity)+1);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:DS.text,lineHeight:1}}>+</button>
              </div>
            </div>}
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:DS.textMuted,marginBottom:5}}>CATEGORIE</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {cats.map(function(c2){var isS=cat===c2;return <button key={c2} onClick={function(){setCat(c2);}} style={{padding:"6px 12px",borderRadius:20,border:"1px solid "+(isS?color+"66":DS.border),background:isS?color+"18":"transparent",color:isS?color:DS.textMuted,fontSize:11,fontWeight:700,cursor:"pointer"}}>{c2}</button>;  })}
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:DS.textMuted,marginBottom:5}}>DESCRIPTION</div>
            <textarea value={desc} onChange={function(e){setDesc(e.target.value);}} placeholder={isRoom?"Vue, equipements, style...":"Ingredients, allergenes, origine..."} rows={3} style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"11px 14px",fontSize:13,color:DS.text,outline:"none",resize:"none",lineHeight:1.5,boxSizing:"border-box"}}/>
          </div>
          {isRoom&&<div style={{display:"flex",gap:10,marginBottom:12}}>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:700,color:DS.textMuted,marginBottom:5}}>OPTIONS INCLUSES</div>
              <input value={opts} onChange={function(e){setOpts(e.target.value);}} placeholder="Ex: Wifi, TV, Minibar..." style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"11px 14px",fontSize:13,color:DS.text,outline:"none",boxSizing:"border-box"}}/>
            </div>
            <div style={{width:120}}>
              <div style={{fontSize:11,fontWeight:700,color:DS.textMuted,marginBottom:5}}>CHAMBRES DISPO.</div>
              <div style={{display:"flex",alignItems:"center",gap:6,background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"8px 10px"}}>
                <button onClick={function(){setStock(Math.max(0,Number(stock)-1));}} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:DS.text,lineHeight:1,flexShrink:0}}>-</button>
                <span style={{flex:1,textAlign:"center",fontSize:14,fontWeight:700,color:DS.text}}>{stock}</span>
                <button onClick={function(){setStock(Number(stock)+1);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:DS.text,lineHeight:1,flexShrink:0}}>+</button>
              </div>
            </div>
          </div>}
          <div style={{background:DS.card,border:"1px solid "+DS.border,borderRadius:12,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:DS.text}}>Disponible</div>
              <div style={{fontSize:11,color:DS.textMuted}}>{avail?"Visible et reservable":"Masque temporairement"}</div>
            </div>
            <div onClick={function(){setAvail(!avail);}} style={{width:48,height:26,borderRadius:13,background:avail?DS.success:DS.border,cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}>
              <div style={{position:"absolute",top:3,left:avail?24:3,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
            </div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={onClose} style={{flex:1,padding:"11px",background:"transparent",border:"1px solid "+DS.border,borderRadius:12,color:DS.textMuted,fontSize:13,cursor:"pointer"}}>Annuler</button>
            <button onClick={save} disabled={!name.trim()||!price} style={{flex:2,padding:"11px",background:name.trim()&&price?color:DS.textDim,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:name.trim()&&price?"pointer":"not-allowed",opacity:name.trim()&&price?1:.6}}>
              {initial?"Mettre à jour":"Ajouter le service"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// == VerifRequestModal : demande de badge de verification ==
function VerifRequestModal(props){
  var onClose=props.onClose;var isPremium=props.isPremium||false;
  var accType=props.accType||"hotel";var onSubmit=props.onSubmit;
  var verifyStatus=props.verifyStatus||null;
  var color=rC(accType);
  var s1=useState(props.initialStep||1);var step=s1[0];var setStep=s1[1];
  var s2=useState(props.prefillName||"");var bizName=s2[0];var setBizName=s2[1];
  var s3=useState(props.prefillCountry||"");var country=s3[0];var setCountry=s3[1];
  var s4=useState("");var contact=s4[0];var setContact=s4[1];
  var s5=useState("");var regNum=s5[0];var setRegNum=s5[1];
  var s6=useState({});var docs=s6[0];var setDocs=s6[1];
  var DOC_LIST=accType==="hotel"
    ?["Registre de commerce","Patente ou licence hotelier","Document d'identité du gérant","Justificatif adresse etablissement"]
    :["Registre de commerce","Autorisation d'ouverture","Document d'identité du gérant","Justificatif adresse etablissement"];
  function setDocFile(d,fileName){setDocs(function(prev){var next=Object.assign({},prev);next[d]=fileName;return next;});}
  function removeDocFile(d){setDocs(function(prev){var next=Object.assign({},prev);delete next[d];return next;});}
  function docCount(){return Object.keys(docs).length;}
  function submit(){if(onSubmit)onSubmit();setStep(4);}
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",zIndex:1400,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:420,background:DS.surface,borderRadius:"22px 22px 0 0",border:"1px solid "+DS.border,maxHeight:"94vh",overflowY:"auto",WebkitOverflowScrolling:"touch",touchAction:"pan-y",animation:"hp-slide-up 0.3s ease"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid "+DS.border,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:DS.text}}>Badge de Verification</div>
            <div style={{fontSize:11,color:DS.textMuted,marginTop:2}}>Processus officiel HotelPlatform Travel</div>
          </div>
          <button onClick={onClose} style={{background:DS.card,border:"1px solid "+DS.border,borderRadius:"50%",width:44,height:44,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={14} color={DS.textMuted}/></button>
        </div>
        <div style={{padding:"0 20px",display:"flex",gap:4,marginTop:16}}>
          {[1,2,3,4].map(function(s){return <div key={s} style={{flex:1,height:3,borderRadius:2,background:s<=step?color:DS.border}}/>;  })}
        </div>
        <div style={{padding:20}}>
          {!isPremium&&step===1&&(
            <div style={{textAlign:"center",paddingTop:8,paddingBottom:8}}>
              <div style={{width:64,height:64,borderRadius:"50%",background:DS.gold+"18",border:"2px solid "+DS.gold,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><Lock size={28} color={DS.gold}/></div>
              <div style={{fontSize:17,fontWeight:800,color:DS.text,marginBottom:8}}>Premium requis</div>
              <div style={{fontSize:13,color:DS.textMuted,lineHeight:1.6,marginBottom:20}}>Un abonnement Premium actif est obligatoire pour soumettre une demande de verification officielle.</div>
              <div style={{background:DS.goldSoft,border:"1px solid "+DS.gold+"33",borderRadius:12,padding:"12px 16px",marginBottom:20,textAlign:"left"}}>
                {["Publications video","Éligible badge vérification","Visibilite boostee","Éligible aux avis clients"].map(function(f,i){return <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:i<3?8:0}}><CheckCircle size={13} color={DS.gold}/><span style={{fontSize:12,color:DS.textMuted}}>{f}</span></div>;})}
              </div>
              <button onClick={onClose} style={{width:"100%",padding:"11px",background:DS.gold,border:"none",borderRadius:12,color:"#000",fontSize:13,fontWeight:900,cursor:"pointer"}}>Obtenir Premium</button>
            </div>
          )}
          {step===1&&isPremium&&(
            <div>
              <div style={{background:color+"12",border:"1px solid "+color+"33",borderRadius:12,padding:"14px 16px",marginBottom:18}}>
                <div style={{fontSize:14,fontWeight:800,color:color,marginBottom:8}}>Processus de verification</div>
                {[["1","Soumission des documents justificatifs","Vous transmettez vos documents officiels"],["2","Contrôle administratif","Notre equipe verifie vos informations sous 48-72h"],["3","Validation ou refus","Vous êtes notifié du résultat par email et dans l app"],["4","Badge public","Le badge s'affiche sur votre profil apres validation"]].map(function(_i){var n=_i[0];var t=_i[1];var s=_i[2];return(<div key={n} style={{display:"flex",gap:10,marginBottom:12}}><div style={{width:24,height:24,borderRadius:"50%",background:color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,fontWeight:800,color:"#fff"}}>{n}</div><div><div style={{fontSize:13,fontWeight:700,color:DS.text}}>{t}</div><div style={{fontSize:11,color:DS.textMuted,marginTop:2}}>{s}</div></div></div>);})}
              </div>
              <div style={{background:DS.warningSoft,border:"1px solid "+DS.warning+"33",borderRadius:10,padding:"10px 14px",marginBottom:18,fontSize:12,color:DS.warning}}>
                Toute fausse déclaration entraîne le refus definitif et la suspension du compte.
              </div>
              <button onClick={function(){setStep(2);}} style={{width:"100%",padding:"11px",background:color,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer"}}>Commencer la demande</button>
            </div>
          )}
          {step===2&&(
            <div>
              <div style={{fontSize:14,fontWeight:800,color:DS.text,marginBottom:14}}>Informations officielles</div>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:700,color:DS.textMuted,marginBottom:5}}>NOM OFFICIEL DE L'ÉTABLISSEMENT</div>
                <input value={bizName} onChange={function(e){setBizName(e.target.value);}} placeholder="Nom exact sur les documents officiels" style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"11px 14px",fontSize:13,color:DS.text,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:700,color:DS.textMuted,marginBottom:5}}>NUMÉRO D'ENREGISTREMENT</div>
                <input value={regNum} onChange={function(e){setRegNum(e.target.value);}} placeholder="RCCM / Patente / Numero officiel" style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"11px 14px",fontSize:13,color:DS.text,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:700,color:DS.textMuted,marginBottom:5}}>PAYS</div>
                <input value={country} onChange={function(e){setCountry(e.target.value);}} placeholder="Ex: Sénégal, Côte d'Ivoire..." style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"11px 14px",fontSize:13,color:DS.text,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div style={{marginBottom:20}}>
                <div style={{fontSize:11,fontWeight:700,color:DS.textMuted,marginBottom:5}}>CONTACT OFFICIEL (EMAIL / TEL)</div>
                <input value={contact} onChange={function(e){setContact(e.target.value);}} placeholder="contact@etablissement.com" style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"11px 14px",fontSize:13,color:DS.text,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={function(){setStep(1);}} style={{flex:1,padding:"11px",background:"transparent",border:"1px solid "+DS.border,borderRadius:12,color:DS.textMuted,fontSize:13,cursor:"pointer"}}>Retour</button>
                <button onClick={function(){if(bizName.trim()&&country.trim()&&contact.trim())setStep(3);}} disabled={!bizName.trim()||!country.trim()||!contact.trim()} style={{flex:2,padding:"11px",background:bizName.trim()&&country.trim()&&contact.trim()?color:DS.textDim,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",opacity:bizName.trim()&&country.trim()&&contact.trim()?1:.6}}>Continuer</button>
              </div>
            </div>
          )}
          {step===3&&(
            <div>
              <div style={{fontSize:14,fontWeight:800,color:DS.text,marginBottom:6}}>Documents requis</div>
              <div style={{fontSize:12,color:DS.textMuted,marginBottom:14}}>Téléversez vos documents officiels (PDF, JPG ou PNG). Ils seront examinés par notre équipe.</div>
              {DOC_LIST.map(function(d){var fileName=docs[d];var has=!!fileName;return(
                <div key={d} style={{marginBottom:8,padding:"12px 14px",background:has?color+"10":DS.card,border:"1px solid "+(has?color+"44":DS.border),borderRadius:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:20,height:20,borderRadius:6,border:"2px solid "+(has?color:DS.border),background:has?color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {has&&<CheckCircle size={12} color="#fff"/>}
                    </div>
                    <span style={{fontSize:13,color:has?color:DS.text,fontWeight:has?700:400,flex:1,minWidth:0}}>{d}</span>
                  </div>
                  {has
                    ? <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,marginLeft:32}}>
                        <FileText size={13} color={DS.textMuted}/>
                        <span style={{fontSize:11,color:DS.textMuted,flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{fileName}</span>
                        <button onClick={function(){removeDocFile(d);}} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><X size={13} color={DS.error}/></button>
                      </div>
                    : <button onClick={function(){var slug=d.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");setDocFile(d,slug+".pdf");}} style={{display:"flex",alignItems:"center",gap:6,marginTop:8,marginLeft:32,padding:"7px 12px",background:DS.surface,border:"1px dashed "+DS.border,borderRadius:8,cursor:"pointer",width:"fit-content"}}>
                        <Plus size={12} color={DS.textMuted}/>
                        <span style={{fontSize:11,color:DS.textMuted,fontWeight:700}}>Joindre un fichier</span>
                      </button>
                  }
                </div>
              );})}
              <div style={{background:DS.primarySoft,border:"1px solid "+DS.primary+"22",borderRadius:10,padding:"10px 14px",marginBottom:20,marginTop:8,fontSize:11,color:DS.textMuted}}>
                Apres soumission, notre équipe vous contactera a : {contact||"votre email enregistre"}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={function(){if((props.initialStep||1)>=3){if(onClose)onClose();}else{setStep(2);}}} style={{flex:1,padding:"11px",background:"transparent",border:"1px solid "+DS.border,borderRadius:12,color:DS.textMuted,fontSize:13,cursor:"pointer"}}>{(props.initialStep||1)>=3?"Annuler":"Retour"}</button>
                <button onClick={submit} disabled={docCount()===0} style={{flex:2,padding:"11px",background:docCount()>0?color:DS.textDim,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:docCount()>0?"pointer":"not-allowed",opacity:docCount()>0?1:.6}}>Soumettre la demande</button>
              </div>
            </div>
          )}
          {step===4&&(
            <div style={{textAlign:"center",paddingTop:8,paddingBottom:16}}>
              <div style={{width:72,height:72,borderRadius:"50%",background:DS.successSoft,border:"2px solid "+DS.success,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><CheckCircle size={32} color={DS.success}/></div>
              <div style={{fontSize:18,fontWeight:900,color:DS.success,marginBottom:8}}>Demande soumise !</div>
              <div style={{fontSize:13,color:DS.textMuted,lineHeight:1.65,marginBottom:20}}>Notre équipe examine votre dossier sous 48-72h. Vous serez notifié par email et dans l'application.</div>
              <div style={{background:DS.card,border:"1px solid "+DS.border,borderRadius:12,padding:"12px 16px",marginBottom:20,textAlign:"left"}}>
                <div style={{fontSize:11,fontWeight:700,color:DS.textDim,letterSpacing:1,marginBottom:8}}>RÉCAPITULATIF</div>
                <div style={{fontSize:13,color:DS.text,marginBottom:4}}>{bizName}</div>
                <div style={{fontSize:12,color:DS.textMuted,marginBottom:4}}>{country}</div>
                <div style={{fontSize:12,color:DS.textMuted}}>{contact}</div>
              </div>
              <button onClick={onClose} style={{width:"100%",padding:"11px",background:color,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer"}}>Fermer</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HotelSvc(props){
  var data=props.data||DataLayer.getHotels()[0];
  var userId=props.userId||null;
  var color=DS.hotel;
  var s1=useState(function(){try{var v=localStorage.getItem("hp_hotelsvc_rooms");return v?JSON.parse(v):(data.rooms||[]);}catch(e){return data.rooms||[];}});var rooms=s1[0];var setRooms=s1[1];
  var s2=useState(null);var editItem=s2[0];var setEditItem=s2[1];
  var s3=useState(false);var showAdd=s3[0];var setShowAdd=s3[1];
  var s4=useState(function(){try{var v=localStorage.getItem("hp_hotelsvc_svcmode");return v||data.svcMode||"hotel";}catch(e){return data.svcMode||"hotel";}});var svcMode=s4[0];var setSvcMode=s4[1];
  var hasResto=svcMode==="combined";
  var s5=useState(function(){try{var v=localStorage.getItem("hp_hotelsvc_dishes");return v?JSON.parse(v):[];}catch(e){return[];}});var menu=s5[0];var setMenu=s5[1];
  var s6=useState(data.svcMode==="restaurant"?"menu":"rooms");var tab=s6[0];var setTab=s6[1];
  var sa=useState(function(){try{var v=localStorage.getItem("hp_hotelsvc_amenities");return v?JSON.parse(v):(data.services||[]).map(function(s,i){return typeof s==="object"?Object.assign({},s):{id:"svc"+i,name:s,active:true};});}catch(e){return(data.services||[]).map(function(s,i){return typeof s==="object"?Object.assign({},s):{id:"svc"+i,name:s,active:true};});}});
  var amenities=sa[0];var setAmenities=sa[1];
  var sb=useState(false);var addSvc=sb[0];var setAddSvc=sb[1];
  var sc=useState("");var newSvcName=sc[0];var setNewSvcName=sc[1];
  var sd=useState(null);var confirmDeleteRoom=sd[0];var setConfirmDeleteRoom=sd[1];
  var se=useState(null);var confirmDeleteDish=se[0];var setConfirmDeleteDish=se[1];
  var sf=useState(null);var confirmDeleteSvc=sf[0];var setConfirmDeleteSvc=sf[1];
  var _hEstabId=data&&data.id?data.id:null;
  function _saveSvcMode(v){
    try{localStorage.setItem("hp_hotelsvc_svcmode",v);}catch(e){}
    if(userId&&DataLayer._client){DataLayer._client.from("profiles").update({svc_mode:v,updated_at:new Date().toISOString()}).eq("user_id",userId).then(function(){});}
  }
  function _saveRooms(rs){try{localStorage.setItem("hp_hotelsvc_rooms",JSON.stringify(rs));}catch(e){}try{DataLayer.saveEstabRooms(_hEstabId,rs);}catch(e){}}
  function _saveDishes(ms){try{localStorage.setItem("hp_hotelsvc_dishes",JSON.stringify(ms));}catch(e){}try{DataLayer.saveEstabDishes(_hEstabId,ms);}catch(e){}}
  function _saveAmenities(am){try{localStorage.setItem("hp_hotelsvc_amenities",JSON.stringify(am));}catch(e){}try{DataLayer.saveEstabAmenities(_hEstabId,am);}catch(e){}}
  function toggleAmenity(id){setAmenities(function(am){var next=am.map(function(a){return a.id===id?Object.assign({},a,{active:!a.active}):a;});_saveAmenities(next);return next;});}
  function addAmenity(){if(!newSvcName.trim())return;var am=amenities.concat([{id:"svc"+Date.now(),name:newSvcName.trim(),active:true}]);setAmenities(am);_saveAmenities(am);setNewSvcName("");setAddSvc(false);}
  function removeAmenity(id){setAmenities(function(am){var next=am.filter(function(a){return a.id!==id;});_saveAmenities(next);return next;});}
  function toggleAvail(id){setRooms(function(rs){var next=rs.map(function(r){return r.id===id?Object.assign({},r,{available:!r.available}):r;});_saveRooms(next);return next;});}
  function toggleMenuAvail(id){setMenu(function(ms){var next=ms.map(function(m){return m.id===id?Object.assign({},m,{available:!m.available}):m;});_saveDishes(next);return next;});}
  var tkH=useToast();var toastH=tkH.show;var ToastH=tkH.Toast;
  function saveRoom(item){
    if(editItem){setRooms(function(rs){var next=rs.map(function(r){return r.id===item.id?item:r;});_saveRooms(next);return next;});toastH("Chambre mise à jour","success");}
    else{setRooms(function(rs){var next=rs.concat([item]);_saveRooms(next);return next;});toastH("Chambre ajoutée","success");}
    setEditItem(null);setShowAdd(false);
  }
  function saveDish(item){
    if(editItem){setMenu(function(ms){var next=ms.map(function(m){return m.id===item.id?item:m;});_saveDishes(next);return next;});toastH("Plat mis a jour","success");}
    else{setMenu(function(ms){var next=ms.concat([item]);_saveDishes(next);return next;});toastH("Plat ajouté","success");}
    setEditItem(null);setShowAdd(false);
  }
  function deleteRoom(id){setRooms(function(rs){var next=rs.filter(function(r){return r.id!==id;});_saveRooms(next);return next;});toastH("Chambre supprimée","info");}
  function deleteDish(id){setMenu(function(ms){var next=ms.filter(function(m){return m.id!==id;});_saveDishes(next);return next;});toastH("Plat supprimé","info");}
  return(
    <div style={{background:DS.bg,paddingBottom:20}}>
      <ToastH/>
      {(showAdd||editItem)&&<ServiceConfigModal mode={tab==="rooms"?"room":"dish"} color={tab==="rooms"?DS.hotel:DS.restaurant} initial={editItem} onClose={function(){setShowAdd(false);setEditItem(null);}} onSave={tab==="rooms"?saveRoom:saveDish}/>}
      <div style={{background:DS.surface,borderBottom:"1px solid "+DS.border,padding:"12px 14px 10px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{fontSize:14,fontWeight:800,color:DS.text}}>Gestion des services</div>
        </div>
        <div style={{marginBottom:10}}>
          <div style={{fontSize:10,fontWeight:700,color:DS.textDim,letterSpacing:1,marginBottom:6}}>TYPE D'ÉTABLISSEMENT</div>
          <div style={{display:"flex",gap:6}}>
            {[["hotel","Hotel uniquement",DS.hotel],["restaurant","Restaurant uniquement",DS.restaurant],["combined","Hotel + Restaurant",DS.primary]].map(function(_i){
              var v=_i[0];var l=_i[1];var col=_i[2];var isSel=svcMode===v;
              return(
                <button key={v} onClick={function(){setSvcMode(v);_saveSvcMode(v);if(v==="hotel")setTab("rooms");if(v==="restaurant")setTab("menu");}} style={{flex:1,padding:"8px 6px",borderRadius:10,border:"1.5px solid "+(isSel?col:DS.border),background:isSel?col+"18":"transparent",cursor:"pointer",textAlign:"center"}}>
                  <div style={{width:14,height:14,borderRadius:"50%",border:"2px solid "+(isSel?col:DS.border),background:isSel?col:"transparent",margin:"0 auto 4px",display:"flex",alignItems:"center",justifyContent:"center"}}>{isSel&&<div style={{width:5,height:5,borderRadius:"50%",background:"#fff"}}/>}</div>
                  <span style={{fontSize:9,fontWeight:700,color:isSel?col:DS.textMuted,lineHeight:1.2,display:"block"}}>{l}</span>
                </button>
              );
            })}
          </div>
        </div>
        {svcMode==="combined"&&(
          <div style={{display:"flex",gap:6}}>
            {[["rooms","Chambres",DS.hotel],["menu","Menu Restaurant",DS.restaurant]].map(function(_i){var t=_i[0];var l=_i[1];var col=_i[2];var isAct=tab===t;return <button key={t} onClick={function(){setTab(t);}} style={{flex:1,padding:"7px 10px",borderRadius:10,border:"1px solid "+(isAct?col:DS.border),background:isAct?col+"18":"transparent",color:isAct?col:DS.textMuted,fontSize:12,fontWeight:700,cursor:"pointer"}}>{l}</button>;})}
          </div>
        )}
      </div>
      <div style={{padding:"10px 14px 0"}}>
        <button onClick={function(){setEditItem(null);setShowAdd(true);}} style={{width:"100%",padding:"10px 14px",background:tab==="rooms"?DS.hotel+"18":DS.restaurant+"18",border:"1px dashed "+(tab==="rooms"?DS.hotel:DS.restaurant),borderRadius:12,color:tab==="rooms"?DS.hotel:DS.restaurant,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:12}}>
          <Plus size={16}/> {tab==="rooms"?"Ajouter une chambre":"Ajouter un plat"}
        </button>
        {tab==="rooms"&&rooms.map(function(r){
          var Ic=getIcon(r.name);
          return(
            <div key={r.id} style={{background:DS.card,borderRadius:12,padding:"12px 14px",marginBottom:10,border:"1px solid "+DS.border}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
                  <div style={{width:34,height:34,borderRadius:9,background:DS.hotel+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ic size={15} color={DS.hotel}/></div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:DS.text}}>{r.name}</div>
                    <div style={{fontSize:11,color:DS.textMuted}}>{r.capacity} pers. {r.category?" - "+r.category:""}{r.stock!==undefined?" - "+r.stock+" chambre"+(r.stock>1?"s":"")+" dispo.":""}</div>
                    {r.options&&<div style={{fontSize:10,color:DS.textDim,marginTop:2}}>{r.options}</div>}
                    {r.description&&<div style={{fontSize:11,color:DS.textMuted,marginTop:3,lineHeight:1.4}}>{r.description}</div>}
                  </div>
                </div>
                <div style={{textAlign:"right",flexShrink:0,marginLeft:8}}>
                  <div style={{fontSize:16,fontWeight:900,color:DS.gold}}>{r.price} EUR</div>
                  <div style={{fontSize:9,color:DS.textMuted}}>/ nuit</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:8,borderTop:"1px solid "+DS.border+"20"}}>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={function(){setEditItem(r);setShowAdd(false);}} style={{padding:"5px 12px",background:DS.primarySoft,border:"none",borderRadius:8,color:DS.primary,fontSize:11,fontWeight:700,cursor:"pointer"}}>Modifier</button>
                  {confirmDeleteRoom===r.id?(
                    <span style={{display:"flex",gap:4,alignItems:"center"}}>
                      <button onClick={function(){setConfirmDeleteRoom(null);}} style={{padding:"5px 10px",background:DS.border,border:"none",borderRadius:8,color:DS.text,fontSize:11,fontWeight:700,cursor:"pointer"}}>Annuler</button>
                      <button onClick={function(){deleteRoom(r.id);setConfirmDeleteRoom(null);}} style={{padding:"5px 10px",background:DS.error,border:"none",borderRadius:8,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>Confirmer</button>
                    </span>
                  ):(
                    <button onClick={function(){setConfirmDeleteRoom(r.id);}} style={{padding:"5px 12px",background:DS.errorSoft,border:"none",borderRadius:8,color:DS.error,fontSize:11,fontWeight:700,cursor:"pointer"}}>Supprimer</button>
                  )}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <span style={{fontSize:11,color:r.available?DS.success:DS.error,fontWeight:700}}>{r.available?"Disponible":"Indisponible"}</span>
                  <div onClick={function(){toggleAvail(r.id);}} style={{width:40,height:22,borderRadius:11,background:r.available?DS.success:DS.border,cursor:"pointer",position:"relative",transition:"background .2s"}}>
                    <div style={{position:"absolute",top:2,left:r.available?20:2,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {svcMode!=="hotel"&&tab==="menu"&&(
          <div>
            {menu.length===0&&<Emp Icon={Utensils} title="Aucun plat" sub="Ajoutez votre premier plat"/>}
            {menu.map(function(m){
              return(
                <div key={m.id} style={{background:DS.card,borderRadius:12,padding:"12px 14px",marginBottom:10,border:"1px solid "+DS.border}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:700,color:DS.text}}>{m.name}</div>
                      {m.category&&<div style={{fontSize:11,color:DS.restaurant,fontWeight:600,marginTop:2}}>{m.category}</div>}
                      {m.description&&<div style={{fontSize:11,color:DS.textMuted,marginTop:3,lineHeight:1.4}}>{m.description}</div>}
                    </div>
                    <div style={{textAlign:"right",flexShrink:0,marginLeft:10}}>
                      <div style={{fontSize:16,fontWeight:900,color:DS.gold}}>{m.price} EUR</div>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:8,borderTop:"1px solid "+DS.border+"20"}}>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={function(){setEditItem(m);setShowAdd(false);}} style={{padding:"5px 12px",background:DS.primarySoft,border:"none",borderRadius:8,color:DS.primary,fontSize:11,fontWeight:700,cursor:"pointer"}}>Modifier</button>
                      {confirmDeleteDish===m.id?(
                        <span style={{display:"flex",gap:4,alignItems:"center"}}>
                          <button onClick={function(){setConfirmDeleteDish(null);}} style={{padding:"5px 10px",background:DS.border,border:"none",borderRadius:8,color:DS.text,fontSize:11,fontWeight:700,cursor:"pointer"}}>Annuler</button>
                          <button onClick={function(){deleteDish(m.id);setConfirmDeleteDish(null);}} style={{padding:"5px 10px",background:DS.error,border:"none",borderRadius:8,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>Confirmer</button>
                        </span>
                      ):(
                        <button onClick={function(){setConfirmDeleteDish(m.id);}} style={{padding:"5px 12px",background:DS.errorSoft,border:"none",borderRadius:8,color:DS.error,fontSize:11,fontWeight:700,cursor:"pointer"}}>Supprimer</button>
                      )}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <span style={{fontSize:11,color:m.available?DS.success:DS.error,fontWeight:700}}>{m.available?"Dispo":"Indispo"}</span>
                      <div onClick={function(){toggleMenuAvail(m.id);}} style={{width:40,height:22,borderRadius:11,background:m.available?DS.success:DS.border,cursor:"pointer",position:"relative",transition:"background .2s"}}>
                        <div style={{position:"absolute",top:2,left:m.available?20:2,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{marginTop:20,paddingTop:16,borderTop:"1px solid "+DS.border}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:800,color:DS.text}}>Services inclus</div>
            <button onClick={function(){setAddSvc(!addSvc);}} style={{padding:"5px 12px",background:DS.primary+"18",border:"1px solid "+DS.primary+"33",borderRadius:20,color:DS.primary,fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}><Plus size={11}/>Ajouter</button>
          </div>
          {addSvc&&(
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <input value={newSvcName} onChange={function(e){setNewSvcName(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter")addAmenity();}} placeholder="Nom du service (ex: Jacuzzi...)" style={{flex:1,background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"9px 12px",fontSize:13,color:DS.text,outline:"none"}}/>
              <button onClick={addAmenity} style={{padding:"9px 14px",background:DS.primary,border:"none",borderRadius:10,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>OK</button>
            </div>
          )}
          {amenities.map(function(am){var Ic=getIcon(am.name);return(
            <div key={am.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid "+DS.border+"18"}}>
              <div style={{width:28,height:28,borderRadius:8,background:(am.active?DS.hotel:DS.border)+"20",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ic size={13} color={am.active?DS.hotel:DS.textDim}/></div>
              <span style={{flex:1,fontSize:12,color:am.active?DS.text:DS.textDim,fontWeight:am.active?600:400}}>{am.name}</span>
              <div onClick={function(){toggleAmenity(am.id);}} style={{width:40,height:22,borderRadius:11,background:am.active?DS.success:DS.border,cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}>
                <div style={{position:"absolute",top:2,left:am.active?20:2,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
              </div>
              {confirmDeleteSvc===am.id?(
                <span style={{display:"flex",gap:4,alignItems:"center"}}>
                  <button onClick={function(){setConfirmDeleteSvc(null);}} style={{padding:"3px 8px",background:DS.border,border:"none",borderRadius:7,color:DS.text,fontSize:10,fontWeight:700,cursor:"pointer"}}>Annuler</button>
                  <button onClick={function(){removeAmenity(am.id);setConfirmDeleteSvc(null);}} style={{padding:"3px 8px",background:DS.error,border:"none",borderRadius:7,color:"#fff",fontSize:10,fontWeight:700,cursor:"pointer"}}>Confirmer</button>
                </span>
              ):(
                <button onClick={function(){setConfirmDeleteSvc(am.id);}} style={{background:"none",border:"none",cursor:"pointer",padding:4,color:DS.error,opacity:.7}}><X size={12} color={DS.error}/></button>
              )}
            </div>
          );})}
        </div>
      </div>
    </div>
  );
}
function RestOff(props){
  var data=props.data||DataLayer.getRestaurants()[0];
  var color=DS.restaurant;
  var _defaultItems=(data.menu||[]).reduce(function(acc,cat){return acc.concat(cat.items.map(function(item){return Object.assign({},item,{id:"d_"+cat.cat+"_"+item.name.replace(/\s/g,""),category:cat.cat,available:true});}));},  []);
  var s1=useState(function(){try{var v=localStorage.getItem("hp_restoff_items");return v?JSON.parse(v):_defaultItems;}catch(e){return _defaultItems;}});
  var items=s1[0];var setItems=s1[1];
  var s2=useState(null);var editItem=s2[0];var setEditItem=s2[1];
  var s3=useState(false);var showAdd=s3[0];var setShowAdd=s3[1];
  var _defaultOffers=(data.offers||[]).map(function(o,i){return Object.assign({},{id:"o"+i,name:typeof o==="string"?o:o.name,price:typeof o==="object"&&o.price?o.price:null,available:true});});
  var s4=useState(function(){try{var v=localStorage.getItem("hp_restoff_offers");return v?JSON.parse(v):_defaultOffers;}catch(e){return _defaultOffers;}});
  var offers=s4[0];var setOffers=s4[1];
  var s4a=useState(false);var showAddOffer=s4a[0];var setShowAddOffer=s4a[1];
  var s4b=useState("");var newOfferName=s4b[0];var setNewOfferName=s4b[1];
  var s4c=useState("");var newOfferPrice=s4c[0];var setNewOfferPrice=s4c[1];
  var s5=useState("menu");var tab=s5[0];var setTab=s5[1];
  var _rEstabId=data&&data.id?data.id:null;
  function _saveOffers(next){try{localStorage.setItem("hp_restoff_offers",JSON.stringify(next));}catch(e){}try{DataLayer.saveEstabOffers(_rEstabId,next);}catch(e){}}
  var tkO=useToast();var toastO=tkO.show;var ToastO=tkO.Toast;
  function deleteOffer(id){var next=offers.filter(function(o){return o.id!==id;});setOffers(next);_saveOffers(next);toastO("Offre supprimée","info");}
  function addOffer(){if(!newOfferName.trim())return;var o={id:"o"+Date.now(),name:newOfferName.trim(),price:newOfferPrice?parseFloat(newOfferPrice):null,available:true};var next=offers.concat([o]);setOffers(next);_saveOffers(next);setNewOfferName("");setNewOfferPrice("");setShowAddOffer(false);toastO("Offre ajoutée","success");}
  function _saveItems(next){try{localStorage.setItem("hp_restoff_items",JSON.stringify(next));}catch(e){}try{DataLayer.saveEstabDishes(_rEstabId,next);}catch(e){}}
  function saveItem(item){
    if(editItem){setItems(function(is){var next=is.map(function(i){return i.id===item.id?item:i;});_saveItems(next);return next;});toastO("Plat mis a jour","success");}
    else{setItems(function(is){var next=is.concat([item]);_saveItems(next);return next;});toastO("Plat ajouté","success");}
    setEditItem(null);setShowAdd(false);
  }
  function deleteItem(id){setItems(function(is){var next=is.filter(function(i){return i.id!==id;});_saveItems(next);return next;});toastO("Plat supprimé","info");}
  function toggleAvail(id){setItems(function(is){var next=is.map(function(i){return i.id===id?Object.assign({},i,{available:!i.available}):i;});_saveItems(next);return next;});}
  var categories=items.reduce(function(acc,item){if(item.category&&acc.indexOf(item.category)<0)acc.push(item.category);return acc;},[]);
  return(
    <div style={{background:DS.bg,paddingBottom:20}}>
      <ToastO/>
      {(showAdd||editItem)&&<ServiceConfigModal mode="dish" color={color} initial={editItem} onClose={function(){setShowAdd(false);setEditItem(null);}} onSave={saveItem}/>}
      <div style={{background:DS.surface,borderBottom:"1px solid "+DS.border,padding:"12px 14px 10px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{fontSize:14,fontWeight:800,color:DS.text}}>Gestion du menu</div>
          <div style={{fontSize:11,color:DS.textMuted}}>{items.length} plat{items.length!==1?"s":""}</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          {[["menu","Menu"],["offres","Offres"]].map(function(_i){var t=_i[0];var l=_i[1];var isAct=tab===t;return <button key={t} onClick={function(){setTab(t);}} style={{flex:1,padding:"7px",borderRadius:10,border:"1px solid "+(isAct?color:DS.border),background:isAct?color+"18":"transparent",color:isAct?color:DS.textMuted,fontSize:12,fontWeight:700,cursor:"pointer"}}>{l}</button>;})}
        </div>
      </div>
      <div style={{padding:"10px 14px 0"}}>
        {tab==="menu"&&(
          <div>
            <button onClick={function(){setEditItem(null);setShowAdd(true);}} style={{width:"100%",padding:"10px 14px",background:DS.restaurant+"18",border:"1px dashed "+DS.restaurant,borderRadius:12,color:DS.restaurant,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:12}}>
              <Plus size={16}/> Ajouter un plat
            </button>
            {categories.map(function(cat){
              var catItems=items.filter(function(i){return i.category===cat;});
              return(
                <div key={cat} style={{marginBottom:16}}>
                  <div style={{fontSize:11,fontWeight:800,color:color,letterSpacing:1.5,marginBottom:8,paddingLeft:2}}>{cat.toUpperCase()}</div>
                  {catItems.map(function(item){
                    return(
                      <div key={item.id} style={{background:DS.card,borderRadius:12,padding:"12px 14px",marginBottom:8,border:"1px solid "+DS.border}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:13,fontWeight:700,color:DS.text}}>{item.name}</div>
                            {item.description&&<div style={{fontSize:11,color:DS.textMuted,marginTop:3,lineHeight:1.4}}>{item.description}</div>}
                          </div>
                          <div style={{textAlign:"right",flexShrink:0,marginLeft:10}}>
                            <div style={{fontSize:15,fontWeight:900,color:DS.gold}}>{item.price} EUR</div>
                          </div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:8,borderTop:"1px solid "+DS.border+"20"}}>
                          <div style={{display:"flex",gap:6}}>
                            <button onClick={function(){setEditItem(item);setShowAdd(false);}} style={{padding:"5px 12px",background:DS.primarySoft,border:"none",borderRadius:8,color:DS.primary,fontSize:11,fontWeight:700,cursor:"pointer"}}>Modifier</button>
                            <button onClick={function(){deleteItem(item.id);}} style={{padding:"5px 12px",background:DS.errorSoft,border:"none",borderRadius:8,color:DS.error,fontSize:11,fontWeight:700,cursor:"pointer"}}>Supprimer</button>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <span style={{fontSize:11,color:item.available?DS.success:DS.error,fontWeight:700}}>{item.available?"Dispo":"Indispo"}</span>
                            <div onClick={function(){toggleAvail(item.id);}} style={{width:40,height:22,borderRadius:11,background:item.available?DS.success:DS.border,cursor:"pointer",position:"relative",transition:"background .2s"}}>
                              <div style={{position:"absolute",top:2,left:item.available?20:2,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {items.length===0&&<Emp Icon={Utensils} title="Menu vide" sub="Ajoutez votre premier plat"/>}
          </div>
        )}
        {tab==="offres"&&(
          <div>
            <button onClick={function(){setShowAddOffer(!showAddOffer);}} style={{width:"100%",padding:"10px 14px",background:color+"18",border:"1px dashed "+color,borderRadius:12,color:color,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:12}}><Plus size={16}/>Ajouter une offre</button>
            {showAddOffer&&<div style={{background:DS.card,borderRadius:12,padding:"12px 14px",marginBottom:12,border:"1px solid "+DS.border}}>
              <input value={newOfferName} onChange={function(e){setNewOfferName(e.target.value);}} placeholder="Nom de l'offre (ex: Menu Découverte)" style={{width:"100%",background:DS.bg,border:"1px solid "+DS.border,borderRadius:8,padding:"8px 12px",fontSize:12,color:DS.text,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
              <div style={{display:"flex",gap:8}}>
                <input value={newOfferPrice} onChange={function(e){setNewOfferPrice(e.target.value);}} placeholder="Prix EUR (optionnel)" type="number" min="0" style={{flex:1,background:DS.bg,border:"1px solid "+DS.border,borderRadius:8,padding:"8px 12px",fontSize:12,color:DS.text,outline:"none"}}/>
                <button onClick={addOffer} style={{padding:"8px 16px",background:color,border:"none",borderRadius:8,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>Ajouter</button>
              </div>
            </div>}
            {offers.map(function(o){return(
              <div key={o.id} style={{background:DS.card,borderRadius:12,padding:"12px 14px",marginBottom:10,border:"1px solid "+DS.border,display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:10,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Tag size={16} color={color}/></div>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:DS.text}}>{o.name}</div>{o.price&&<div style={{fontSize:12,color:DS.gold,fontWeight:700}}>{o.price} EUR</div>}</div>
                <button onClick={function(){deleteOffer(o.id);}} style={{background:"none",border:"none",cursor:"pointer",padding:4,color:DS.error}}><X size={14} color={DS.error}/></button>
              </div>
            );})}
            {offers.length===0&&<Emp Icon={Tag} title="Aucune offre" sub="Ajoutez vos offres spéciales"/>}
          </div>
        )}
      </div>
    </div>
  );
}
function genQRPixels(id){
  // Génère une grille 10x10 déterministe à partir de l'ID de réservation
  var str = String(id||"");
  var pixels = [];
  var hash = 0;
  for(var i=0;i<str.length;i++){ hash = ((hash<<5)-hash)+str.charCodeAt(i); hash|=0; }
  // Force les 3 carrés de position (coins haut-gauche, haut-droit, bas-gauche)
  var anchors = [0,1,2,10,11,12,20,21,22, 7,8,9,17,18,19,27,28,29, 70,71,72,80,81,82,90,91,92];
  for(var p=0;p<100;p++){
    var isAnchor=anchors.indexOf(p)!==-1;
    if(isAnchor){ pixels.push(true); continue; }
    var seed=hash^(p*0x9e3779b9);seed=seed^(seed>>>16);seed=Math.imul(seed,0x85ebca6b);seed=seed^(seed>>>13);seed=Math.imul(seed,0xc2b2ae35);seed=seed^(seed>>>16);
    pixels.push((seed&1)===1);
  }
  return pixels;
}
function ProResa(props){
  var proType=props.proType;var onOpenChat=props.onOpenChat;
  var clientPrivacySettings=props.clientPrivacySettings||{locked:false,msgPermission:"everyone"};
  var selfEmail=props.selfEmail||"";
  var CONNECTED_CLIENT_NAME=props.selfName||(function(){try{return localStorage.getItem("hp_client_display_name")||"";}catch(e){return "";}}())||(selfEmail.split("@")[0]||"Client");
  var color=rC(proType);
  var _liveResas=BookingService.getAll().map(function(r){return {id:r.id,client:r.clientName||CONNECTED_CLIENT_NAME,service:r.service||"Reservation",dateIn:r.dateIn||"",dateOut:r.dateOut||r.dateIn||"",nights:r.nights||1,guests:r.guests||1,total:r.total||0,payMode:r.payMode||"sans",status:r.status||"pending",qrScanned:r.status==="consumed"};});
  var s1=useState(function(){
    return _liveResas;
  });
  var resas=s1[0];var setResas=s1[1];
  var s2=useState("all");var filter=s2[0];var setFilter=s2[1];
  var s3=useState(null);var scanTarget=s3[0];var setScanTarget=s3[1];
  var tkR=useToast();var toastR=tkR.show;var ToastR=tkR.Toast;
  var sRSk=useState(true);var resaSkLoading=sRSk[0];var setResaSkLoading=sRSk[1];
  useEffect(function(){var t=setTimeout(function(){setResaSkLoading(false);},350);return function(){clearTimeout(t);};},[]);
  var filtered=filter==="all"?resas:resas.filter(function(r){return r.status===filter;});
  var sColors={confirmed:DS.success,pending:DS.warning,refused:DS.error,consumed:DS.textDim};
  var sLabels={confirmed:"Confirmée",pending:"En attente",refused:"Refusée",consumed:"Consommée"};
  function _persistResaStatus(id,patch){try{var all=BookingService.getAll();var updated=all.map(function(r){return r.id===id?Object.assign({},r,patch):r;});localStorage.setItem("hp_resas_all",JSON.stringify(updated));}catch(e){}try{if(patch&&patch.status)DataLayer.updateReservationStatus(id,patch.status);}catch(e2){}}
  function confirmResa(id){setResas(function(rs){return rs.map(function(x){return x.id===id?Object.assign({},x,{status:"confirmed"}):x;});});_persistResaStatus(id,{status:"confirmed"});toastR("Réservation confirmée","success");}
  function refuseResa(id){setResas(function(rs){return rs.map(function(x){return x.id===id?Object.assign({},x,{status:"refused"}):x;});});_persistResaStatus(id,{status:"refused"});toastR("Réservation refusée","info");}
  function scanQR(id){setResas(function(rs){return rs.map(function(x){return x.id===id?Object.assign({},x,{qrScanned:true,status:"consumed"}):x;});});_persistResaStatus(id,{status:"consumed"});setScanTarget(null);toastR("Arrivée confirmée · Client marqué présent","success");}
  return(
    <div style={{background:DS.bg,paddingBottom:20}}>
      <ToastR/>
      {scanTarget&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",zIndex:1300,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
          <div style={{width:"100%",maxWidth:360,background:DS.surface,borderRadius:20,overflow:"hidden",border:"1px solid "+DS.border}}>
            <div style={{background:color,padding:"16px",textAlign:"center"}}>
              <div style={{fontSize:16,fontWeight:800,color:"#fff"}}>Scanner le QR Code</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.8)",marginTop:2}}>{scanTarget.client}</div>
            </div>
            <div style={{padding:20}}>
              <div style={{background:"rgba(0,0,0,.6)",borderRadius:14,padding:20,marginBottom:16,textAlign:"center",border:"2px dashed "+color}}>
                <div style={{fontSize:12,color:DS.textMuted,marginBottom:12}}>Zone de scan (simulation)</div>
                <div style={{display:"inline-flex",padding:10,background:"#fff",borderRadius:10}}>
                  <div style={{width:100,height:100,display:"grid",gridTemplateColumns:"repeat(10,1fr)",gap:1}}>
                    {genQRPixels(scanTarget.id).map(function(px,i){return <div key={i} style={{background:px?"#000":"#fff"}}/>;  })}
                  </div>
                </div>
                <div style={{fontSize:10,color:DS.textMuted,marginTop:8,fontFamily:"monospace"}}>{scanTarget.id}</div>
              </div>
              <div style={{background:DS.card,borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:12,color:DS.textMuted}}>
                {scanTarget.service} - {scanTarget.dateIn} au {scanTarget.dateOut} - {scanTarget.guests} pers.
                <div style={{fontSize:13,fontWeight:800,color:scanTarget.payMode==="avec"?DS.gold:DS.success,marginTop:4}}>{scanTarget.payMode==="avec"?scanTarget.total+" EUR":"Reservation sans paiement"}</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={function(){setScanTarget(null);}} style={{flex:1,padding:"11px",background:"transparent",border:"1px solid "+DS.border,borderRadius:12,color:DS.textMuted,fontSize:13,cursor:"pointer"}}>Annuler</button>
                <button onClick={function(){scanQR(scanTarget.id);}} style={{flex:2,padding:"11px",background:DS.success,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer"}}>Confirmer l'arrivée</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,padding:"14px 14px 10px"}}>
        {[[resas.filter(function(r){return r.status==="pending";}).length,"En attente",DS.warning],[resas.filter(function(r){return r.status==="confirmed";}).length,"Confirmées",DS.success],[resas.reduce(function(a,r){return a+(r.payMode==="avec"?r.total:0);},0)+" EUR","Revenus",DS.gold]].map(function(_i,i){var n=_i[0];var l=_i[1];var col=_i[2];return <div key={i} style={{background:DS.card,borderRadius:10,padding:"10px 6px",border:"1px solid "+DS.border,textAlign:"center"}}><div style={{fontSize:16,fontWeight:900,color:col}}>{n}</div><div style={{fontSize:10,color:DS.textMuted,marginTop:2}}>{l}</div></div>;})}
      </div>
      <div style={{display:"flex",gap:5,padding:"0 14px",marginBottom:12,overflowX:"auto"}}>
        {[["all","Toutes"],["pending","En attente"],["confirmed","Confirmées"],["consumed","Consommées"],["refused","Refusées"]].map(function(_i){var v=_i[0];var l=_i[1];var isAct=filter===v;return <button key={v} onClick={function(){setFilter(v);}} style={{padding:"6px 12px",borderRadius:20,border:"1px solid "+(isAct?color:DS.border),background:isAct?color+"18":"transparent",color:isAct?color:DS.textMuted,fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>{l}</button>;})}
      </div>
      <div style={{padding:"0 14px"}}>
        {resaSkLoading?<ResaSkeleton/>:<>{filtered.map(function(r,_ri){return(
          <div key={r.id} style={{background:DS.card,borderRadius:14,padding:"14px",marginBottom:12,border:"1px solid "+(r.qrScanned?DS.textDim+"44":DS.border),opacity:r.status==="consumed"?0.7:1,animation:"hp-item-in 0.32s ease both",animationDelay:(_ri*55)+"ms"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:800,color:DS.text,display:"flex",alignItems:"center",gap:6}}>
                  {r.client===CONNECTED_CLIENT_NAME&&clientPrivacySettings.locked
                    ? <span style={{display:"flex",alignItems:"center",gap:5,color:DS.textMuted,filter:"blur(2.5px)",userSelect:"none"}}>{r.client}</span>
                    : <span>{r.client}</span>
                  }
                  {r.client===CONNECTED_CLIENT_NAME&&clientPrivacySettings.locked&&<Lock size={11} color={DS.textDim}/>}
                </div>
                <div style={{fontSize:12,color:DS.textMuted,marginTop:2}}>{r.service}</div>
                <div style={{fontSize:11,color:DS.textDim,marginTop:3}}>{r.dateIn} au {r.dateOut} - {r.guests} pers.</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0,marginLeft:8}}>
                <div style={{fontSize:16,fontWeight:900,color:r.payMode==="avec"?DS.gold:DS.success}}>{r.payMode==="avec"?r.total+" EUR":"Sans paiement"}</div>
                <div style={{display:"flex",alignItems:"center",gap:4,marginTop:4,justifyContent:"flex-end"}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:sColors[r.status]||DS.textMuted,flexShrink:0}}/>
                  <span style={{fontSize:10,color:DS.textMuted}}>{sLabels[r.status]||r.status}</span>
                </div>
              </div>
            </div>
            {r.qrScanned&&<div style={{background:DS.successSoft,border:"1px solid "+DS.success+"33",borderRadius:8,padding:"6px 10px",marginBottom:8,display:"flex",alignItems:"center",gap:6}}><CheckCircle size={12} color={DS.success}/><span style={{fontSize:11,color:DS.success,fontWeight:700}}>Cette réservation est désormais consommée</span></div>}
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {r.status==="pending"&&<button onClick={function(){confirmResa(r.id);}} style={{padding:"7px 14px",background:DS.successSoft,border:"1px solid "+DS.success+"33",borderRadius:8,color:DS.success,fontSize:11,fontWeight:700,cursor:"pointer"}}>Confirmer</button>}
              {r.status==="pending"&&<button onClick={function(){refuseResa(r.id);}} style={{padding:"7px 14px",background:DS.errorSoft,border:"1px solid "+DS.error+"33",borderRadius:8,color:DS.error,fontSize:11,fontWeight:700,cursor:"pointer"}}>Refuser</button>}
              {r.status==="confirmed"&&!r.qrScanned&&<button onClick={function(){setScanTarget(r);}} style={{padding:"7px 14px",background:color+"18",border:"1px solid "+color+"44",borderRadius:8,color:color,fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}><Eye size={12}/>Scanner QR</button>}
              <button onClick={onOpenChat} style={{padding:"7px 14px",background:DS.card,border:"1px solid "+DS.border,borderRadius:8,color:DS.textMuted,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}><MessageCircle size={12}/>Chat</button>
            </div>
          </div>
        );})}
        {filtered.length===0&&<Emp Icon={Calendar} title="Aucune réservation" sub="Les demandes de vos clients apparaîtront ici"/>}</> }
      </div>
    </div>
  );
}
function ProProf(props){
  var proType=props.proType;var onSettings=props.onSettings;var onPremium=props.onPremium;var isPremium=props.isPremium||false;var onPrivacy=props.onPrivacy;var resaHistory=props.resaHistory||[];var premiumData=props.premiumData||null;var onRenewPremium=props.onRenewPremium;var profilePhoto=props.profilePhoto||null;var onPhotoChange=props.onPhotoChange||null;var coverPhoto=props.coverPhoto||null;var onCoverChange=props.onCoverChange||null;
  var _allProD=proType==="hotel"?DataLayer.getHotels():DataLayer.getRestaurants();
  var data=(props.authUserId&&_allProD.find(function(h){return h.userId===props.authUserId;}))||_allProD[0];
  var color=rC(proType);
  var s1=useState("about");var tab=s1[0];var setTab=s1[1];
  var s2=useState(false);var showVerif=s2[0];var setShowVerif=s2[1];
  var _vfKey="hp_verif_status_"+(proType||"hotel");
  var s3=useState(function(){try{return localStorage.getItem(_vfKey)||null;}catch(e){return null;}});var verifStatus=s3[0];var _setVerifStatusRaw=s3[1];
  function setVerifStatus(v){_setVerifStatusRaw(v);try{if(v)localStorage.setItem(_vfKey,v);else localStorage.removeItem(_vfKey);}catch(e){}}
  var _descKey="hp_pro_desc_"+(proType||"hotel");
  var sd=useState(function(){try{var v=localStorage.getItem(_descKey);return v||data.description;}catch(e){return data.description;}});var description=sd[0];var setDescription=sd[1];
  var se=useState(false);var editingAbout=se[0];var setEditingAbout=se[1];
  var sdv=useState(description);var draftDesc=sdv[0];var setDraftDesc=sdv[1];
  var tkp=useToast();var toastP=tkp.show;var ToastP=tkp.Toast;
  var _proUploadRef=useRef(null);
  var _proCoverUploadRef=useRef(null);
  var _sProViewer=useState(null);var _proViewer=_sProViewer[0];var _setProViewer=_sProViewer[1];
  var _sPPMenu=useState(false);var _ppMenu=_sPPMenu[0];var _setPPMenu=_sPPMenu[1];
  var _sPPPend=useState(null);var _ppPend=_sPPPend[0];var _setPPPend=_sPPPend[1];
  var _sPCMenu=useState(false);var _pcMenu=_sPCMenu[0];var _setPCMenu=_sPCMenu[1];
  var _sPCPend=useState(null);var _pcPend=_sPCPend[0];var _setPCPend=_sPCPend[1];
  var _sShowEditProf=useState(false);var _showEditProf=_sShowEditProf[0];var _setShowEditProf=_sShowEditProf[1];
  var _sDraftName=useState(data.name||"");var _draftName=_sDraftName[0];var _setDraftName=_sDraftName[1];
  var _sDraftLoc=useState(data.location||"");var _draftLoc=_sDraftLoc[0];var _setDraftLoc=_sDraftLoc[1];
  var _sProSaving=useState(false);var _proSaving=_sProSaving[0];var _setProSaving=_sProSaving[1];
  function _handleProPhotoFile(e){var f=e.target.files&&e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(ev){_setPPPend(ev.target.result);};r.readAsDataURL(f);e.target.value="";}
  function _handleProCoverFile(e){var f=e.target.files&&e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(ev){_setPCPend(ev.target.result);};r.readAsDataURL(f);e.target.value="";}
  function _saveProPhoto(){if(!_ppPend)return;if(onPhotoChange)onPhotoChange(_ppPend);_setPPPend(null);_setPPMenu(false);toastP("Photo de profil mise à jour","success");}
  function _saveProCover(){if(!_pcPend)return;if(onCoverChange)onCoverChange(_pcPend);_setPCPend(null);_setPCMenu(false);toastP("Photo de couverture mise à jour","success");}
  function _deleteProPhoto(){if(onPhotoChange)onPhotoChange(null);_setPPMenu(false);toastP("Photo supprimée","success");}
  function _saveProProfile(){
    var nm=_draftName.trim();var lc=_draftLoc.trim();if(!nm)return;
    _setProSaving(true);
    var _uid=props.authUserId;
    var _done=function(){
      _setProSaving(false);_setShowEditProf(false);
      try{if(proType==="hotel"){DataLayer._cache.hotels=DataLayer._cache.hotels.map(function(h){return(h.userId===_uid||(h.id===data.id&&!_uid))?Object.assign({},h,{name:nm,author:nm,location:lc}):h;});}
      else{DataLayer._cache.restaurants=DataLayer._cache.restaurants.map(function(r){return(r.userId===_uid||(r.id===data.id&&!_uid))?Object.assign({},r,{name:nm,author:nm,location:lc}):r;});}
      if(DataLayer._onUpdate)DataLayer._onUpdate();}catch(ex){}
      toastP("Profil mis à jour","success");
    };
    if(DataLayer._client&&_uid){DataLayer._client.from("profiles").update({display_name:nm,location:lc}).eq("user_id",_uid).then(_done).catch(_done);}
    else{_done();}
  }
  function saveAbout(){if(!draftDesc.trim())return;var d=draftDesc.trim();setDescription(d);try{localStorage.setItem(_descKey,d);}catch(e){}try{DataLayer.saveEstabDescription(data&&data.id,d);}catch(e){}setEditingAbout(false);toastP("À propos mis à jour","success");}
  var premiumActive=isPremium||data.isPremium;
  // Periode de grace : badge reste visible 7 jours apres expiration de l abonnement
  var _graceActive=false;
  var _graceEnd=null;
  if(!premiumActive&&premiumData&&premiumData.expiresAt){
    var _expDate=new Date(premiumData.expiresAt);
    _graceEnd=new Date(_expDate.getTime()+7*24*60*60*1000);
    _graceActive=new Date()<_graceEnd;
  }
  // Badge visible seulement si approuve par le Panel ET (premium actif OU periode de grace)
  var isVerified=verifStatus==="approved"&&(premiumActive||_graceActive);
  return(
    <div style={{paddingBottom:20}}>
      <ImgViewer src={_proViewer} onClose={function(){_setProViewer(null);}}/>
      <input id="hp-pro-photo-input" ref={_proUploadRef} type="file" accept="image/*" style={{display:"none"}} onChange={_handleProPhotoFile}/>
      <input id="hp-pro-cover-input" ref={_proCoverUploadRef} type="file" accept="image/*" style={{display:"none"}} onChange={_handleProCoverFile}/>
      <ToastP/>
      {showVerif&&<VerifRequestModal isPremium={premiumActive} accType={proType} verifyStatus={verifStatus} initialStep={3} prefillName={data.name} prefillCountry={data.location} onClose={function(){setShowVerif(false);}} onSubmit={function(){setVerifStatus("pending");toastP("Demande de verification soumise - Examen sous 48-72h","success");}}/>}
      {_ppMenu&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:2000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={function(){_setPPMenu(false);_setPPPend(null);}}>
        <div onClick={function(e){e.stopPropagation();}} style={{width:"100%",maxWidth:420,background:DS.surface,borderRadius:"22px 22px 0 0",border:"1px solid "+DS.border,padding:"20px 16px 32px",animation:"hp-slide-up 0.28s ease"}}>
          {_ppPend?(
            <div>
              <div style={{textAlign:"center",fontSize:14,fontWeight:800,color:DS.text,marginBottom:14}}>Aperçu de la photo</div>
              <img src={_ppPend} alt="" style={{width:96,height:96,borderRadius:"50%",objectFit:"cover",display:"block",margin:"0 auto 16px",border:"3px solid "+color}}/>
              <div style={{display:"flex",gap:10}}>
                <button onClick={function(){_setPPPend(null);}} style={{flex:1,padding:"13px",background:"transparent",border:"1px solid "+DS.border,borderRadius:12,color:DS.textMuted,fontSize:13,fontWeight:700,cursor:"pointer"}}>Annuler</button>
                <button onClick={_saveProPhoto} style={{flex:1,padding:"13px",background:color,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer"}}>Enregistrer</button>
              </div>
            </div>
          ):(
            <div>
              <div style={{textAlign:"center",fontSize:14,fontWeight:800,color:DS.text,marginBottom:20}}>Photo de profil</div>
              <label htmlFor="hp-pro-photo-input" style={{width:"100%",padding:"15px 16px",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:14,borderBottom:"1px solid "+DS.border+"30",boxSizing:"border-box"}}>
                <div style={{width:36,height:36,borderRadius:10,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center"}}><Camera size={16} color={color}/></div>
                <span style={{fontSize:14,color:DS.text,fontWeight:600}}>Changer la photo</span>
              </label>
              <button onClick={function(){if(profilePhoto){_setProViewer(profilePhoto);_setPPMenu(false);}}} disabled={!profilePhoto} style={{width:"100%",padding:"15px 16px",background:"none",border:"none",cursor:profilePhoto?"pointer":"default",display:"flex",alignItems:"center",gap:14,borderBottom:"1px solid "+DS.border+"30",opacity:profilePhoto?1:0.35}}>
                <div style={{width:36,height:36,borderRadius:10,background:DS.primarySoft,display:"flex",alignItems:"center",justifyContent:"center"}}><Eye size={16} color={DS.primary}/></div>
                <span style={{fontSize:14,color:DS.text,fontWeight:600}}>Voir la photo</span>
              </button>
              <button onClick={profilePhoto?_deleteProPhoto:undefined} disabled={!profilePhoto} style={{width:"100%",padding:"15px 16px",background:"none",border:"none",cursor:profilePhoto?"pointer":"default",display:"flex",alignItems:"center",gap:14,opacity:profilePhoto?1:0.35}}>
                <div style={{width:36,height:36,borderRadius:10,background:DS.errorSoft,display:"flex",alignItems:"center",justifyContent:"center"}}><Trash2 size={16} color={DS.error}/></div>
                <span style={{fontSize:14,color:DS.error,fontWeight:600}}>Supprimer la photo</span>
              </button>
            </div>
          )}
        </div>
      </div>)}
      {_pcMenu&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:2000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={function(){_setPCMenu(false);_setPCPend(null);}}>
        <div onClick={function(e){e.stopPropagation();}} style={{width:"100%",maxWidth:420,background:DS.surface,borderRadius:"22px 22px 0 0",border:"1px solid "+DS.border,padding:"20px 16px 32px",animation:"hp-slide-up 0.28s ease"}}>
          {_pcPend?(
            <div>
              <div style={{textAlign:"center",fontSize:14,fontWeight:800,color:DS.text,marginBottom:14}}>Aperçu de la couverture</div>
              <img src={_pcPend} alt="" style={{width:"100%",height:120,objectFit:"cover",display:"block",borderRadius:12,marginBottom:16}}/>
              <div style={{display:"flex",gap:10}}>
                <button onClick={function(){_setPCPend(null);}} style={{flex:1,padding:"13px",background:"transparent",border:"1px solid "+DS.border,borderRadius:12,color:DS.textMuted,fontSize:13,fontWeight:700,cursor:"pointer"}}>Annuler</button>
                <button onClick={_saveProCover} style={{flex:1,padding:"13px",background:color,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer"}}>Enregistrer</button>
              </div>
            </div>
          ):(
            <div>
              <div style={{textAlign:"center",fontSize:14,fontWeight:800,color:DS.text,marginBottom:20}}>Photo de couverture</div>
              <label htmlFor="hp-pro-cover-input" style={{width:"100%",padding:"15px 16px",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:14,borderBottom:"1px solid "+DS.border+"30",boxSizing:"border-box"}}>
                <div style={{width:36,height:36,borderRadius:10,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center"}}><Camera size={16} color={color}/></div>
                <span style={{fontSize:14,color:DS.text,fontWeight:600}}>Changer la couverture</span>
              </label>
              {coverPhoto&&<button onClick={function(){_setProViewer(coverPhoto);_setPCMenu(false);}} style={{width:"100%",padding:"15px 16px",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:36,height:36,borderRadius:10,background:DS.primarySoft,display:"flex",alignItems:"center",justifyContent:"center"}}><Eye size={16} color={DS.primary}/></div>
                <span style={{fontSize:14,color:DS.text,fontWeight:600}}>Voir la couverture</span>
              </button>}
            </div>
          )}
        </div>
      </div>)}
      {_showEditProf&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:2000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={function(){_setShowEditProf(false);}}>
        <div onClick={function(e){e.stopPropagation();}} style={{width:"100%",maxWidth:420,background:DS.surface,borderRadius:"22px 22px 0 0",border:"1px solid "+DS.border,padding:"20px 16px 32px",animation:"hp-slide-up 0.28s ease"}}>
          <div style={{textAlign:"center",fontSize:15,fontWeight:800,color:DS.text,marginBottom:20}}>Modifier le profil</div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:DS.textDim,marginBottom:5}}>NOM DE L'ÉTABLISSEMENT</div>
            <input value={_draftName} onChange={function(e){_setDraftName(e.target.value);}} placeholder="Nom de l'établissement" style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"11px 14px",fontSize:13,color:DS.text,outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:20}}>
            <div style={{fontSize:11,fontWeight:700,color:DS.textDim,marginBottom:5}}>LOCALISATION</div>
            <input value={_draftLoc} onChange={function(e){_setDraftLoc(e.target.value);}} placeholder="Ville, Pays" style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"11px 14px",fontSize:13,color:DS.text,outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={function(){_setShowEditProf(false);}} style={{flex:1,padding:"13px",background:"transparent",border:"1px solid "+DS.border,borderRadius:12,color:DS.textMuted,fontSize:13,fontWeight:700,cursor:"pointer"}}>Annuler</button>
            <button onClick={_saveProProfile} disabled={_proSaving} style={{flex:1,padding:"13px",background:color,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",opacity:_proSaving?0.7:1}}>
              {_proSaving?<span style={{display:"inline-block",width:14,height:14,border:"2px solid #fff",borderTopColor:"transparent",borderRadius:"50%",animation:"hp-spin 0.7s linear infinite",verticalAlign:"middle"}}/>:"Enregistrer"}
            </button>
          </div>
        </div>
      </div>)}
      <div style={{position:"relative",height:120,flexShrink:0}}>
        <img src={coverPhoto||data.img} alt="" onClick={function(){var src=coverPhoto||data.img;if(src)_setProViewer(src);}} style={{width:"100%",height:"100%",objectFit:"cover",cursor:"pointer"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 40%,rgba(0,0,0,.6))",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:-44,left:14,zIndex:3}}>
          <DualAv sz={72} letter={(data.name[0]||"H").toUpperCase()} innerImg={profilePhoto} outerImg={coverPhoto||data.img} verified={isVerified} uploadRef={_proUploadRef} onClickInner={function(){_setPPMenu(true);}} onClickOuter={function(){var src=coverPhoto||data.img;if(src)_setProViewer(src);}}/>
        </div>
        <div style={{position:"absolute",bottom:8,right:14,display:"flex",alignItems:"center",gap:6}}>
          {verifStatus==="pending"&&<div style={{background:DS.warning+"22",border:"1px solid "+DS.warning+"44",borderRadius:20,padding:"2px 8px"}}><span style={{fontSize:10,color:DS.warning,fontWeight:700}}>En attente</span></div>}
          <button onClick={function(){_setPCMenu(true);}} style={{background:"rgba(0,0,0,.55)",border:"1px solid rgba(255,255,255,.2)",borderRadius:20,padding:"5px 10px",display:"flex",alignItems:"center",gap:5,cursor:"pointer"}}>
            <Camera size={12} color="#fff"/><span style={{fontSize:10,color:"#fff",fontWeight:700}}>Couverture</span>
          </button>
        </div>
        <div style={{position:"absolute",top:8,right:8,display:"flex",gap:6}}>
          <button onClick={function(){if(onSettings)onSettings();}} style={{background:"rgba(0,0,0,.5)",border:"none",borderRadius:"50%",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><Settings size={14} color="#fff"/></button>
          {!premiumActive&&<div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:10,color:DS.gold,fontWeight:700,fontStyle:"italic"}}>Debloquez les avis clients !</span><button onClick={function(){if(onPremium)onPremium();}} style={{background:DS.gold,border:"none",borderRadius:20,padding:"6px 12px",color:"#000",fontSize:11,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap"}}>Premium</button></div>}
        {premiumActive&&premiumData&&<button onClick={function(){if(onRenewPremium)onRenewPremium();}} style={{display:"flex",alignItems:"center",gap:5,background:DS.goldSoft,border:"1px solid "+DS.gold+"33",borderRadius:20,padding:"6px 12px",color:DS.gold,fontSize:10,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}><VBadge sz={11}/>Actif jusqu'au {new Date(premiumData.expiresAt).toLocaleDateString("fr-FR")}</button>}
        </div>
      </div>
      <div style={{padding:"56px 16px 10px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><div style={{fontSize:20,fontWeight:900,color:DS.text}}>{data.name}</div></div>
        </div>
        <div style={{fontSize:12,color:DS.textMuted,marginBottom:6}}>{_draftLoc||data.location}</div>
        {isPremium?((_draftLoc||data.location)?<div style={{display:"flex",alignItems:"center",gap:5,marginBottom:8,padding:"4px 10px",background:"#14532d22",borderRadius:20,width:"fit-content"}}><MapPin size={11} color="#4ade80"/><span style={{fontSize:11,fontWeight:700,color:"#4ade80"}}>GPS actif — visible par les clients</span></div>:<div onClick={function(){_setDraftName(data.name||"");_setDraftLoc(data.location||"");_setShowEditProf(true);}} style={{display:"flex",alignItems:"center",gap:5,marginBottom:8,padding:"4px 10px",background:DS.card,border:"1px solid "+DS.border,borderRadius:20,width:"fit-content",cursor:"pointer"}}><MapPin size={11} color={DS.textMuted}/><span style={{fontSize:11,fontWeight:600,color:DS.textMuted}}>Configurer votre position GPS</span></div>):<div style={{display:"flex",alignItems:"center",gap:5,marginBottom:8,padding:"4px 10px",background:DS.card,border:"1px solid "+DS.border,borderRadius:20,width:"fit-content",opacity:0.5}}><MapPin size={11} color={DS.textMuted}/><span style={{fontSize:11,color:DS.textMuted}}>GPS</span><span style={{fontSize:9,fontWeight:800,color:DS.gold,background:DS.goldSoft,borderRadius:6,padding:"1px 5px"}}>Premium</span></div>}
        <button onClick={function(){_setDraftName(data.name||"");_setDraftLoc(data.location||"");_setShowEditProf(true);}} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",background:DS.card,border:"1px solid "+DS.border,borderRadius:20,color:DS.textMuted,fontSize:12,fontWeight:700,cursor:"pointer",marginBottom:10}}>
          <Edit2 size={13} color={color}/>Modifier le profil
        </button>
        {!isVerified&&!verifStatus&&(
          <button onClick={function(){if(premiumActive){setShowVerif(true);}else{if(onPremium)onPremium();}}} style={{width:"100%",padding:"10px 14px",background:premiumActive?"transparent":DS.card,border:"1px solid "+(premiumActive?color+"44":DS.border),borderRadius:12,color:premiumActive?color:DS.textDim,fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:12}}>
            {premiumActive?<ShieldCheck size={14}/>:<Lock size={14}/>} <span style={{color:DS.success}}>Le badge officiel inspire la confiance et attire davantage de clients</span>
          </button>
        )}
        {verifStatus==="pending"&&(
          <div style={{background:DS.warningSoft,border:"1px solid "+DS.warning+"33",borderRadius:12,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
            <AlertTriangle size={14} color={DS.warning}/>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:DS.warning}}>Verification en cours</div><div style={{fontSize:11,color:DS.textMuted}}>Examen du dossier sous 48-72h par notre equipe</div></div>
          </div>
        )}
        {verifStatus==="approved"&&isVerified&&(
          <div style={{background:DS.successSoft,border:"1px solid "+DS.success+"33",borderRadius:12,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
            <ShieldCheck size={14} color={DS.success}/>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:DS.success}}>Établissement vérifié</div><div style={{fontSize:11,color:DS.textMuted}}>{_graceActive&&!premiumActive?"Badge actif — "+Math.ceil((_graceEnd-new Date())/(1000*60*60*24))+" jours restants (renouvelez votre abonnement)":"Badge officiel actif"}</div></div>
          </div>
        )}
        {verifStatus==="approved"&&!isVerified&&!premiumActive&&(
          <div style={{background:DS.errorSoft,border:"1px solid "+DS.error+"33",borderRadius:12,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
            <Lock size={14} color={DS.error}/>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:DS.error}}>Badge suspendu</div><div style={{fontSize:11,color:DS.textMuted}}>Renouvelez votre abonnement Premium pour reafficher votre badge</div></div>
            <button onClick={function(){if(onPremium)onPremium();}} style={{padding:"6px 12px",background:DS.gold,border:"none",borderRadius:8,color:"#000",fontSize:11,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap"}}>Renouveler</button>
          </div>
        )}
        <div style={{display:"flex",gap:7,marginBottom:12}}>
          {[[fmtK(data.followers),"Abonnés"],[null,"Note"],[fmtK(data.reviewCount),"Avis"],[data.priceFrom?(data.priceFrom+" EUR"):"—","Depuis"]].map(function(_i,i){var v=_i[0];var l=_i[1];return <div key={i} style={{flex:1,background:DS.card,borderRadius:9,padding:"7px 0",textAlign:"center",border:"1px solid "+DS.border}}><div style={{fontSize:12,fontWeight:800,color:DS.text,display:"flex",alignItems:"center",justifyContent:"center",gap:2}}>{l==="Note"?<><Stars r={Math.round(data.rating||0)} sz={10}/><span style={{fontSize:10,color:DS.gold,fontWeight:800,marginLeft:2}}>{data.rating||"—"}</span></>:v}</div><div style={{fontSize:9,color:DS.textMuted}}>{l}</div></div>;})}
        </div>
        <div style={{display:"flex",gap:4,marginBottom:14}}>
          {[["about","À propos"],["services","Services"],["stats","Stats"]].map(function(_i){var t=_i[0];var l=_i[1];var isAct=tab===t;return <button key={t} onClick={function(){setTab(t);}} style={{flex:1,padding:"7px",borderRadius:10,border:"1px solid "+(isAct?color:DS.border),background:isAct?color+"18":"transparent",color:isAct?color:DS.textMuted,fontSize:11,fontWeight:700,cursor:"pointer",textAlign:"center"}}>{l}</button>;})}
        </div>
        {tab==="about"&&(
          editingAbout?(
            <div>
              <textarea value={draftDesc} onChange={function(ev){setDraftDesc(ev.target.value);}} rows={5} placeholder="Decrivez votre etablissement..." style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"11px 14px",fontSize:13,color:DS.text,outline:"none",resize:"none",lineHeight:1.6,boxSizing:"border-box",marginBottom:10}}/>
              <div style={{display:"flex",gap:8}}>
                <button onClick={function(){setDraftDesc(description);setEditingAbout(false);}} style={{flex:1,padding:"9px",background:"transparent",border:"1px solid "+DS.border,borderRadius:10,color:DS.textMuted,fontSize:12,cursor:"pointer"}}>Annuler</button>
                <button onClick={saveAbout} style={{flex:1,padding:"9px",background:color,border:"none",borderRadius:10,color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer"}}>Enregistrer</button>
              </div>
            </div>
          ):(
            <div>
              <div style={{fontSize:13,color:DS.textMuted,lineHeight:1.6,marginBottom:10}}>{description}</div>
              <button onClick={function(){setDraftDesc(description);setEditingAbout(true);}} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,color:DS.textMuted,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                <Edit2 size={12}/>Modifier la description
              </button>
            </div>
          )
        )}
        {tab==="services"&&(function(){
          var _svcs=[];
          try{
            if(proType==="hotel"){var va=localStorage.getItem("hp_hotelsvc_amenities");_svcs=va?JSON.parse(va).filter(function(a){return a.active;}):(data.services||[]);}
            else{var vb=localStorage.getItem("hp_restoff_offers");_svcs=vb?JSON.parse(vb):(data.offers||[]);}
          }catch(ex){_svcs=data.services||data.offers||[];}
          if(!_svcs.length)_svcs=data.services||data.offers||[];
          return _svcs.map(function(s,i){var name=typeof s==="string"?s:s.name;var Ic=getIcon(name);return <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid "+DS.border+"20"}}><div style={{width:30,height:30,borderRadius:8,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic size={13} color={color}/></div><div style={{fontSize:12,color:DS.text}}>{name}</div></div>;});
        })()}
        {tab==="stats"&&(function(){
          var _resas=BookingService.getAll();
          var _nbResas=_resas.length;
          var _confirmed=_resas.filter(function(r){return r.status==="confirmed"||r.status==="consumed";}).length;
          var _conversion=_nbResas>0?Math.round((_confirmed/_nbResas)*1000)/10:0;
          var _rvKey="hp_reviews_"+(data&&data.id||"x");
          var _nbAvis=0;try{var _rv=JSON.parse(localStorage.getItem(_rvKey)||"[]");_nbAvis=_rv.length;}catch(ex){}
          var _revenue=_resas.filter(function(r){return r.payMode==="avec";}).reduce(function(s,r){return s+(r.total||0);},0);
          return(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{[["Réservations",String(_nbResas),color],[_revenue>0?_revenue.toFixed(0)+" EUR":"—","Revenus",DS.gold],[_conversion+"%","Conversion",DS.success],[String(_nbAvis),"Avis reçus",DS.primary]].map(function(_i){var v=_i[0];var l=_i[1];var col=_i[2];return <div key={l} style={{background:DS.card,borderRadius:10,padding:"10px",border:"1px solid "+DS.border}}><div style={{fontSize:16,fontWeight:900,color:col}}>{v}</div><div style={{fontSize:10,color:DS.textMuted}}>{l}</div></div>;})} </div>);
        })()}
      </div>
    </div>
  );
}
// == NOTIFICATION DATA (NC = client, NP = pro) — defaults avant persistance ==
// ICON_MAP : cle string → composant React (serialisable en JSON)
var ICON_MAP={Calendar:Calendar,MessageCircle:MessageCircle,Star:Star,Users:Users,Heart:Heart,Bell:Bell};
var NC_DATA = [];
var NP_DATA = [];

var COUNTRIES_LIST=["Afghanistan","Afrique du Sud","Albanie","Algerie","Allemagne","Angola","Arabie Saoudite","Argentine","Australie","Autriche","Azerbaidjan","Bahrain","Bangladesh","Belgique","Benin","Bolivie","Botswana","Bresil","Burkina Faso","Burundi","Cambodge","Cameroun","Canada","Cap-Vert","Chili","Chine","Chypre","Colombie","Comores","Congo","Cote d Ivoire","Croatie","Cuba","Danemark","Djibouti","Egypte","Emirats Arabes Unis","Equateur","Erythree","Espagne","Ethiopie","Finlande","France","Gabon","Gambie","Ghana","Grece","Guatemala","Guinee","Guinee-Bissau","Guinee equatoriale","Haiti","Honduras","Hongrie","Inde","Indonesie","Irak","Iran","Irlande","Islande","Israel","Italie","Jamaique","Japon","Jordanie","Kazakhstan","Kenya","Kosovo","Koweit","Lesotho","Liban","Liberia","Libye","Luxembourg","Madagascar","Malawi","Mali","Maroc","Mauritanie","Maurice","Mexique","Moldavie","Mongolie","Montenegro","Mozambique","Namibie","Nepal","Nicaragua","Niger","Nigeria","Norvege","Nouvelle-Zelande","Oman","Ouganda","Pakistan","Palestine","Panama","Paraguay","Pays-Bas","Peru","Philippines","Pologne","Portugal","Qatar","Republique Centrafricaine","Republique Democratique du Congo","Republique Dominicaine","Republique Tcheque","Roumanie","Royaume-Uni","Rwanda","Senegal","Serbie","Sierra Leone","Singapour","Slovaquie","Slovenie","Somalie","Soudan","Soudan du Sud","Sri Lanka","Suede","Suisse","Tanzanie","Tchad","Togo","Tunisie","Turquie","Ukraine","Uruguay","Venezuela","Vietnam","Yemen","Zambie","Zimbabwe"];
function ProOnboarding(props){
  var auth=props.auth;var onComplete=props.onComplete;var accent=rC(auth.type);
  var s1=useState("");var name=s1[0];var setName=s1[1];
  var s2=useState("");var city=s2[0];var setCity=s2[1];
  var s3=useState("");var country=s3[0];var setCountry=s3[1];
  var s3b=useState(false);var showCountryDrop=s3b[0];var setShowCountryDrop=s3b[1];
  var s3c=useState("");var countrySearch=s3c[0];var setCountrySearch=s3c[1];
  var s4=useState(auth.type==="hotel"?"hotel":"restaurant");var svcMode=s4[0];var setSvcMode=s4[1];
  var s5=useState(false);var loading=s5[0];var setLoading=s5[1];
  var s6=useState("");var err=s6[0];var setErr=s6[1];
  var filteredCountries=COUNTRIES_LIST.filter(function(c){return c.toLowerCase().includes(countrySearch.toLowerCase());});
  var canSave=!loading&&name.trim().length>0&&city.trim().length>0&&country.length>0;
  async function save(){
    if(!name.trim()){setErr("Veuillez saisir le nom de votre établissement.");return;}
    if(!city.trim()){setErr("Veuillez saisir la ville.");return;}
    if(!country){setErr("Veuillez sélectionner le pays.");return;}
    setLoading(true);setErr("");
    var loc=city.trim()+", "+country;
    var client=DataLayer._client;
    if(client){
      var r=await client.from("profiles").upsert([{user_id:auth.userId,display_name:name.trim(),account_type:auth.type,svc_mode:svcMode,location:loc}],{onConflict:"user_id"});
      if(r.error){setErr("Erreur de sauvegarde (code: "+r.error.code+"). Vérifiez votre connexion.");setLoading(false);return;}
    }
    onComplete({user_id:auth.userId,display_name:name.trim(),account_type:auth.type,svc_mode:svcMode,location:city.trim()+", "+country,description:"",verified:false});
  }
  return(<div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:DS.bg,padding:"24px 20px",fontFamily:"'DM Sans','Inter',sans-serif",overflowY:"auto"}} onClick={function(){if(showCountryDrop)setShowCountryDrop(false);}}>
    <div style={{width:"100%",maxWidth:400}}>
      <div style={{fontSize:22,fontWeight:900,color:DS.text,marginBottom:4}}>Configurer votre établissement</div>
      <div style={{fontSize:13,color:DS.textMuted,marginBottom:24}}>Ces informations seront visibles par les clients sur la plateforme.</div>
      {auth.type==="hotel"&&<div style={{marginBottom:18}}>
        <div style={{fontSize:12,fontWeight:700,color:DS.textMuted,marginBottom:8}}>Type de service *</div>
        {[["hotel","Hotel uniquement",DS.hotel],["restaurant","Restaurant uniquement",DS.restaurant],["combined","Hotel + Restaurant",DS.primary]].map(function(_i){var v=_i[0];var l=_i[1];var col=_i[2];var isSel=svcMode===v;return(<button key={v} onClick={function(){setSvcMode(v);}} style={{width:"100%",padding:"9px 12px",marginBottom:6,borderRadius:10,border:"1px solid "+(isSel?col+"66":DS.border),background:isSel?col+"14":DS.card,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:8,boxSizing:"border-box"}}><div style={{width:16,height:16,borderRadius:"50%",border:"2px solid "+(isSel?col:DS.border),background:isSel?col:"transparent",flexShrink:0}}/><span style={{fontSize:12,color:isSel?col:DS.textMuted,fontWeight:isSel?700:400}}>{l}</span></button>);})}
      </div>}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:700,color:DS.textMuted,marginBottom:6}}>Nom de l'etablissement *</div>
        <input value={name} onChange={function(e){setName(e.target.value);}} placeholder={auth.type==="hotel"?"Ex: Grand Hotel Royal":"Ex: Le Jardin Gourmand"} style={{width:"100%",padding:"12px 14px",borderRadius:12,border:"1px solid "+(name.trim()?DS.primary+44:DS.border),background:DS.card,color:DS.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
      </div>
      <div style={{marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:700,color:DS.textMuted,marginBottom:6}}>Ville *</div>
        <input value={city} onChange={function(e){setCity(e.target.value);}} placeholder="Ex: Brazzaville" style={{width:"100%",padding:"12px 14px",borderRadius:12,border:"1px solid "+(city.trim()?DS.primary+44:DS.border),background:DS.card,color:DS.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
      </div>
      <div style={{marginBottom:22,position:"relative"}}>
        <div style={{fontSize:12,fontWeight:700,color:DS.textMuted,marginBottom:6}}>Pays *</div>
        <button onClick={function(e){e.stopPropagation();setShowCountryDrop(!showCountryDrop);setCountrySearch("");}} style={{width:"100%",padding:"12px 14px",borderRadius:12,border:"1px solid "+(country?DS.primary+44:DS.border),background:DS.card,color:country?DS.text:DS.textMuted,fontSize:13,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",justifyContent:"space-between",boxSizing:"border-box"}}>
          <span>{country||"Sélectionner un pays"}</span>
          <ChevronDown size={14} color={DS.textMuted}/>
        </button>
        {showCountryDrop&&<div onClick={function(e){e.stopPropagation();}} style={{position:"absolute",top:"100%",left:0,right:0,background:DS.surface,border:"1px solid "+DS.border,borderRadius:12,zIndex:200,boxShadow:"0 8px 24px rgba(0,0,0,.18)",overflow:"hidden",marginTop:4}}>
          <div style={{padding:"8px 10px",borderBottom:"1px solid "+DS.border}}>
            <input autoFocus value={countrySearch} onChange={function(e){setCountrySearch(e.target.value);}} placeholder="Rechercher un pays..." style={{width:"100%",padding:"7px 10px",borderRadius:8,border:"1px solid "+DS.border,background:DS.card,color:DS.text,fontSize:12,outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{maxHeight:180,overflowY:"auto"}}>
            {filteredCountries.length===0&&<div style={{padding:"12px 14px",fontSize:12,color:DS.textMuted,textAlign:"center"}}>Aucun pays trouvé</div>}
            {filteredCountries.map(function(c){return(<button key={c} onClick={function(){setCountry(c);setShowCountryDrop(false);setCountrySearch("");}} style={{width:"100%",padding:"10px 14px",background:country===c?accent+"14":"transparent",border:"none",cursor:"pointer",textAlign:"left",fontSize:12,color:country===c?accent:DS.text,fontWeight:country===c?700:400,display:"block",boxSizing:"border-box"}}>{c}</button>);})}
          </div>
        </div>}
      </div>
      {err&&<div style={{color:DS.error,fontSize:12,marginBottom:12,fontWeight:600,background:DS.error+"12",padding:"8px 12px",borderRadius:8}}>{err}</div>}
      <button onClick={save} disabled={!canSave} style={{width:"100%",padding:"14px",background:canSave?accent:DS.textDim,border:"none",borderRadius:12,color:"#fff",fontSize:14,fontWeight:800,cursor:canSave?"pointer":"not-allowed",opacity:canSave?1:0.5,transition:"all .2s"}}>
        {loading?<span style={{display:"inline-block",width:14,height:14,border:"2px solid #fff",borderTopColor:"transparent",borderRadius:"50%",animation:"hp-spin 0.7s linear infinite",verticalAlign:"middle",marginRight:6}}/>:null}Enregistrer et continuer
      </button>
      <div style={{marginTop:12,fontSize:11,color:DS.textMuted,textAlign:"center"}}>Tous les champs marques * sont obligatoires</div>
    </div>
  </div>);
}

export default function App() {
  useAnimations();
  // Rafraichissement quand les donnees Supabase arrivent (remplace la demo)
  var sdv=useState(0); var dataVersion=sdv[0]; var setDataVersion=sdv[1];
  useEffect(function(){
    // Branche le rafraichissement de l'UI sur la couche de donnees
    DataLayer._onUpdate = function(){ setDataVersion(function(v){ return v+1; }); };
    // Declenche la synchronisation Supabase si un client est disponible.
    try{
      if(typeof window!=="undefined" && window.__supabase){
        DataLayer.syncFromSupabase(window.__supabase);
      }
    }catch(e){}
    return function(){ DataLayer._onUpdate = null; };
  },[]);

  var s0=useState(null);  var auth=s0[0];          var setAuth=s0[1];
  var _initNeedsOB=(function(){try{return!localStorage.getItem("hp_acc_type");}catch(e){return true;}})();
  var sOB=useState(_initNeedsOB);var needsOnboarding=sOB[0];var setNeedsOnboarding=sOB[1];
  // Persistance de session Supabase : restaure la session au rechargement + ecoute les changements
  useEffect(function(){
    var sb = (typeof window!=="undefined" && window.__supabase) ? window.__supabase : null;
    if(!sb) return;
    sb.auth.getSession().then(function(res){
      var session = res.data && res.data.session;
      if(session && session.user){
        var meta = session.user.user_metadata || {};
        var accType = meta.account_type || "client";
        var status = accType !== "client" ? "pending" : "active";
        // Sync hp_acc_type with Supabase metadata to avoid onboarding flash
        try{localStorage.setItem("hp_acc_type", accType);}catch(e){}
        setNeedsOnboarding(false);
        setAuth(AuthService.buildSession(accType, status, session.user.email, session.user.id));
        // Sync photo profil depuis Supabase si localStorage vide
        try{
          if(!localStorage.getItem("hp_profile_photo")){
            DataLayer.syncProfilePhoto(session.user.id, function(url){
              if(url){setProfilePhotoRaw(url);try{localStorage.setItem("hp_profile_photo",url);}catch(e){}}
            });
          }
          if(!localStorage.getItem("hp_cover_photo")){
            DataLayer.syncCoverPhoto(session.user.id, function(url){
              if(url){setCoverPhotoRaw(url);try{localStorage.setItem("hp_cover_photo",url);}catch(e){}}
            });
          }
        }catch(e){}
      }
    }).catch(function(){});
    var sub = sb.auth.onAuthStateChange(function(event, session){
      if(event==="SIGNED_IN" && session && session.user){
        var meta = session.user.user_metadata || {};
        var accType = meta.account_type || "client";
        var status = accType !== "client" ? "pending" : "active";
        try{localStorage.setItem("hp_acc_type", accType);}catch(e){}
        setNeedsOnboarding(false);
        setAuth(function(prev){
          if(prev) return prev;
          // Sync photo profil depuis Supabase à la connexion si localStorage vide
          try{
            if(!localStorage.getItem("hp_profile_photo")){
              DataLayer.syncProfilePhoto(session.user.id, function(url){
                if(url){setProfilePhotoRaw(url);try{localStorage.setItem("hp_profile_photo",url);}catch(e){}}
              });
            }
            if(!localStorage.getItem("hp_cover_photo")){
              DataLayer.syncCoverPhoto(session.user.id, function(url){
                if(url){setCoverPhotoRaw(url);try{localStorage.setItem("hp_cover_photo",url);}catch(e){}}
              });
            }
          }catch(e){}
          return AuthService.buildSession(accType, status, session.user.email, session.user.id);
        });
      } else if(event==="SIGNED_OUT"){
        setAuth(null);
      }
    });
    return function(){ if(sub && sub.data && sub.data.subscription) sub.data.subscription.unsubscribe(); };
  },[]);
  var s1=useState(false); var offline=s1[0];        var setOff=s1[1];
  var s2=useState("feed");var cTab=s2[0];           var setCTab=s2[1];
  var s3=useState("feed");var pTab=s3[0];           var setPTab=s3[1];
  var s4=useState(false); var notifsOpen=s4[0];     var setNotifs=s4[1];
  var s5=useState(false); var sett=s5[0];           var setSett=s5[1];
  var s6=useState(null);  var estab=s6[0];          var setEstab=s6[1];
  var s7=useState(null);  var book=s7[0];           var setBook=s7[1];
  var s8=useState(false); var showPremium=s8[0];    var setShowPremium=s8[1];
  // Splash pub — une seule fois par session (sessionStorage, pas localStorage)
  var _splashSeen=(function(){try{return!!sessionStorage.getItem("hp_splash_seen");}catch(e){return false;}})();
  var sSplash=useState(!_splashSeen);var showSplashAd=sSplash[0];var setShowSplashAd=sSplash[1];
  function closeSplashAd(){try{sessionStorage.setItem("hp_splash_seen","1");}catch(e){}setShowSplashAd(false);}
  var s9=useState(false); var showPrivacy=s9[0];    var setShowPrivacy=s9[1];
  var s9b=useState(function(){try{var v=localStorage.getItem("hp_privacy");return v?JSON.parse(v):{locked:false,pseudo:false,vis:"public",msgPermission:"everyone"};}catch(e){return{locked:false,pseudo:false,vis:"public",msgPermission:"everyone"};}});var privacySettings=s9b[0];var setPrivacySettings=s9b[1];
  function updatePrivacy(patch){
    if(!isPremium){setShowPremium(true);return;}
    setPrivacySettings(function(prev){
      var next=Object.assign({},prev,patch);
      try{localStorage.setItem("hp_privacy",JSON.stringify(next));}catch(e){}
      if(DataLayer._client&&_authForUserData&&_authForUserData.userId){
        DataLayer._client.from("profiles").update({privacy_settings:next,updated_at:new Date().toISOString()}).eq("user_id",_authForUserData.userId).then(function(){});
      }
      return next;
    });
    toastApp("Paramètres de confidentialité mis à jour","success");
  }
  var s10=useState(function(){try{var v=localStorage.getItem("hp_premium");return v?JSON.parse(v):null;}catch(e){return null;}});var premiumData=s10[0];    var setPremiumData=s10[1];
  var _sCDN=useState(function(){try{return localStorage.getItem("hp_client_display_name")||"";}catch(e){return "";}});var clientDisplayName=_sCDN[0];var setClientDisplayName=_sCDN[1];
  function _onClientNameChange(nm){setClientDisplayName(nm);try{localStorage.setItem("hp_client_display_name",nm);}catch(e){}}
  var isPremium=premiumData!==null && new Date(premiumData.expiresAt)>new Date();
  function _savePremiumToDB(pd){
    var sb=DataLayer._client;var uid=_authForUserData&&_authForUserData.userId;var atype=_authForUserData&&_authForUserData.type;
    if(sb&&uid){sb.from("profiles").update({premium_data:pd,is_premium:pd!==null,updated_at:new Date().toISOString()}).eq("user_id",uid).then(function(){});}
    try{var _prem=pd!==null;var _cache=atype==="restaurant"?DataLayer._cache.restaurants:DataLayer._cache.hotels;var _idx=_cache.findIndex(function(h){return h.userId===uid;});if(_idx>=0){_cache[_idx]=Object.assign({},_cache[_idx],{isPremium:_prem});if(DataLayer._onUpdate)DataLayer._onUpdate();}}catch(ex){}
  }
  function subscribePremium(plan,durationMonths){
    var now=new Date();
    var exp=new Date(now);
    exp.setMonth(exp.getMonth()+durationMonths);
    var pd={plan:plan,durationMonths:durationMonths,startedAt:now.toISOString(),expiresAt:exp.toISOString()};
    setPremiumData(pd);
    try{localStorage.setItem("hp_premium",JSON.stringify(pd));}catch(e){}
    _savePremiumToDB(pd);
    setShowPremium(false);
    tk.show("Premium actif jusqu'au "+exp.toLocaleDateString("fr-FR"),"success");
  }
  function renewPremium(){
    if(!premiumData)return;
    var base=new Date(premiumData.expiresAt)>new Date()?new Date(premiumData.expiresAt):new Date();
    var exp=new Date(base);
    exp.setMonth(exp.getMonth()+premiumData.durationMonths);
    var pd=Object.assign({},premiumData,{expiresAt:exp.toISOString()});
    setPremiumData(pd);
    try{localStorage.setItem("hp_premium",JSON.stringify(pd));}catch(e){}
    _savePremiumToDB(pd);
    tk.show("Abonnement renouvelé jusqu'au "+exp.toLocaleDateString("fr-FR"),"success");
  }
  function cancelPremium(){
    setPremiumData(null);
    try{localStorage.removeItem("hp_premium");}catch(e){}
    _savePremiumToDB(null);
    tk.show("Abonnement Premium annulé","success");
  }
  var s11=useState(function(){try{return JSON.parse(localStorage.getItem("hp_resas")||"[]");}catch(e){return[];}});
  var resaHistory=s11[0];   var setResaHistory=s11[1];
  var s12=useState(function(){try{return JSON.parse(localStorage.getItem("hp_following")||"[]");}catch(e){return[];}});
  var followingIds=s12[0];  var setFollowingIds=s12[1];
  var s13fav=useState(function(){try{return JSON.parse(localStorage.getItem("hp_fav_estabs")||"[]");}catch(e){return[];}});
  var favEstabIds=s13fav[0]; var setFavEstabIds=s13fav[1];
  var sNotif=useState(function(){try{var v=localStorage.getItem("hp_notifs");if(!v)return null;var p=JSON.parse(v);if(Array.isArray(p)&&p.length>0&&!p[0].icon){localStorage.removeItem("hp_notifs");return null;}return p;}catch(e){return null;}});
  var _notifStored=sNotif[0]; var setNotifStored=sNotif[1];
  var sNotifPrefs=useState(function(){try{var v=localStorage.getItem("hp_notif_prefs");return v?JSON.parse(v):{reservation:true,message:true,promo:true,follow:true};}catch(e){return{reservation:true,message:true,promo:true,follow:true};}});
  var notifPrefs=sNotifPrefs[0]; var setNotifPrefs=sNotifPrefs[1];
  function updateNotifPrefs(patch){
    setNotifPrefs(function(prev){
      var next=Object.assign({},prev,patch);
      try{localStorage.setItem("hp_notif_prefs",JSON.stringify(next));}catch(e){}
      if(DataLayer._client&&auth&&auth.userId){
        DataLayer._client.from("profiles").update({notif_prefs:next,updated_at:new Date().toISOString()}).eq("user_id",auth.userId).then(function(){});
      }
      return next;
    });
  }
  // Charge favoris, follows et notif_prefs depuis Supabase au login
  var _authForUserData=s0[0];
  useEffect(function(){
    if(!_authForUserData||!_authForUserData.userId||!DataLayer._client)return;
    DataLayer._client.from("profiles").select("following,fav_estabs,notif_prefs,premium_data,privacy_settings,display_name").eq("user_id",_authForUserData.userId).maybeSingle()
      .then(function(res){
        if(!res||!res.data)return;
        var d=res.data;
        if(d.following&&Array.isArray(d.following)&&d.following.length>0){
          setFollowingIds(d.following);
          try{localStorage.setItem("hp_following",JSON.stringify(d.following));}catch(e){}
        }
        if(d.fav_estabs&&Array.isArray(d.fav_estabs)&&d.fav_estabs.length>0){
          setFavEstabIds(d.fav_estabs);
          try{localStorage.setItem("hp_fav_estabs",JSON.stringify(d.fav_estabs));}catch(e){}
        }
        if(d.notif_prefs&&typeof d.notif_prefs==="object"){
          setNotifPrefs(d.notif_prefs);
          try{localStorage.setItem("hp_notif_prefs",JSON.stringify(d.notif_prefs));}catch(e){}
        }
        if(d.premium_data&&typeof d.premium_data==="object"&&d.premium_data.expiresAt){
          setPremiumData(d.premium_data);
          try{localStorage.setItem("hp_premium",JSON.stringify(d.premium_data));}catch(e){}
        }
        if(d.privacy_settings&&typeof d.privacy_settings==="object"){
          setPrivacySettings(d.privacy_settings);
          try{localStorage.setItem("hp_privacy",JSON.stringify(d.privacy_settings));}catch(e){}
        }
        if(d.display_name&&typeof d.display_name==="string"&&d.display_name.trim()){
          _onClientNameChange(d.display_name.trim());
        }
      }).catch(function(){});
  },[_authForUserData&&_authForUserData.userId]);
  var sPPhoto=useState(function(){try{return localStorage.getItem("hp_profile_photo")||null;}catch(e){return null;}});var profilePhoto=sPPhoto[0];var setProfilePhotoRaw=sPPhoto[1];
  function setProfilePhoto(v){
    setProfilePhotoRaw(v);
    try{if(v)localStorage.setItem("hp_profile_photo",v);else localStorage.removeItem("hp_profile_photo");}catch(e){}
    // Upload vers Supabase Storage si c'est un DataURL base64
    if(v&&v.startsWith("data:")&&DataLayer._client&&auth&&auth.userId){
      try{
        var _arr=v.split(",");
        // Validation MIME stricte — seuls les formats images autorisés
        var _mimeMatch=_arr[0].match(/:(image\/(jpeg|jpg|png|webp|gif));/);
        if(!_mimeMatch){ console.warn("[Photo] Type MIME non autorise"); return; }
        var _mime=_mimeMatch[1];
        var _ext=_mimeMatch[2]==="jpg"?"jpg":_mimeMatch[2];
        var _bstr=atob(_arr[1]);
        // Validation taille : max 5 MB cote client avant upload
        if(_bstr.length>5*1024*1024){ console.warn("[Photo] Fichier trop volumineux (max 5 MB)"); return; }
        var _u8=new Uint8Array(_bstr.length);
        for(var _i=0;_i<_bstr.length;_i++){_u8[_i]=_bstr.charCodeAt(_i);}
        var _blob=new Blob([_u8],{type:_mime});
        // Token unique pour eviter les race conditions si l'utilisateur change de photo rapidement
        var _uploadToken=Date.now();
        setProfilePhotoRaw._lastToken=_uploadToken;
        var _file=new File([_blob],"profile."+_ext,{type:_mime});
        DataLayer.uploadProfilePhoto(_file, auth.userId, auth.type||"client", function(url){
          // N'applique l'URL CDN que si c'est toujours le dernier upload demande
          if(url&&setProfilePhotoRaw._lastToken===_uploadToken){
            setProfilePhotoRaw(url);
            try{localStorage.setItem("hp_profile_photo",url);}catch(e){}
          }
        });
      }catch(ex){ console.warn("[Photo] Erreur conversion base64:", ex); }
    }
  }
  var sCoverPhoto=useState(function(){try{return localStorage.getItem("hp_cover_photo")||null;}catch(e){return null;}});var coverPhoto=sCoverPhoto[0];var setCoverPhotoRaw=sCoverPhoto[1];
  function setCoverPhoto(v){
    setCoverPhotoRaw(v);
    try{if(v)localStorage.setItem("hp_cover_photo",v);else localStorage.removeItem("hp_cover_photo");}catch(e){}
    if(v&&v.startsWith("data:")&&DataLayer._client&&auth&&auth.userId){
      try{
        var _ca=v.split(",");
        var _cm=_ca[0].match(/:(image\/(jpeg|jpg|png|webp|gif));/);
        if(!_cm){ console.warn("[Cover] Type MIME non autorise"); return; }
        var _cmime=_cm[1];var _cext=_cm[2]==="jpg"?"jpg":_cm[2];
        var _cb=atob(_ca[1]);
        if(_cb.length>8*1024*1024){ console.warn("[Cover] Fichier trop volumineux (max 8 MB)"); return; }
        var _cu8=new Uint8Array(_cb.length);
        for(var _ci=0;_ci<_cb.length;_ci++){_cu8[_ci]=_cb.charCodeAt(_ci);}
        var _cblob=new Blob([_cu8],{type:_cmime});
        var _ctoken=Date.now();
        setCoverPhotoRaw._lastToken=_ctoken;
        var _cfile=new File([_cblob],"cover."+_cext,{type:_cmime});
        DataLayer.uploadCoverPhoto(_cfile, auth.userId, auth.type||"hotel", function(url){
          if(url&&setCoverPhotoRaw._lastToken===_ctoken){
            setCoverPhotoRaw(url);
            try{localStorage.setItem("hp_cover_photo",url);}catch(e){}
          }
        });
      }catch(ex){ console.warn("[Cover] Erreur conversion base64:", ex); }
    }
  }
  var sCEmail=useState(false);var showChangeEmail=sCEmail[0];var setShowChangeEmail=sCEmail[1];
  var sCPwd=useState(false);var showChangePwd=sCPwd[0];var setShowChangePwd=sCPwd[1];
  var tk=useToast(); var Toast=tk.Toast; var toastApp=tk.show;
  // === Bouton retour systeme (Android/navigateur) : ferme l'ecran courant au lieu de quitter l'app ===
  var anyOverlayOpen=(estab!==null)||(book!==null)||sett||notifsOpen||showPremium||showPrivacy||showChangeEmail||showChangePwd;
  function closeTopOverlay(){
    // Ordre de priorite : du plus "haut" (modale) au plus "bas" (ecran)
    if(showChangeEmail){setShowChangeEmail(false);return;}
    if(showChangePwd){setShowChangePwd(false);return;}
    if(showPremium){setShowPremium(false);return;}
    if(showPrivacy){setShowPrivacy(false);return;}
    if(notifsOpen){setNotifs(false);return;}
    if(book!==null){setBook(null);return;}
    if(estab!==null){setEstab(null);return;}
    if(sett){setSett(false);return;}
  }
  var overlayRef=useRef(false);
  overlayRef.current=anyOverlayOpen;
  // Ref toujours a jour vers closeTopOverlay — evite la closure gelee dans useEffect
  var closeTopOverlayRef=useRef(null);
  closeTopOverlayRef.current=closeTopOverlay;
  var guardPushed=useRef(false);
  // Installe UN SEUL listener popstate — utilise les refs pour lire l'etat courant
  useEffect(function(){
    // Arme une entree initiale pour capturer le premier retour
    try{window.history.pushState({hpGuard:true},"");}catch(e){}
    function onPop(){
      if(overlayRef.current){
        closeTopOverlayRef.current();
        try{window.history.pushState({hpGuard:true},"");}catch(e){}
      }
    }
    window.addEventListener("popstate",onPop);
    return function(){window.removeEventListener("popstate",onPop);};
  },[]);
  // Re-arme l'entree d'historique a chaque ouverture d'ecran
  useEffect(function(){
    if(anyOverlayOpen&&!guardPushed.current){
      guardPushed.current=true;
      try{window.history.pushState({hpGuard:true},"");}catch(e){}
    }else if(!anyOverlayOpen){
      guardPushed.current=false;
    }
  },[anyOverlayOpen]);
  function toggleFollowGlobal(id){
    var was=followingIds.indexOf(id)>=0;
    setFollowingIds(function(f){
      var next=was?f.filter(function(x){return x!==id;}):f.concat([id]);
      try{localStorage.setItem("hp_following",JSON.stringify(next));}catch(e){}
      if(DataLayer._client&&auth&&auth.userId){
        DataLayer._client.from("profiles").update({following:next,updated_at:new Date().toISOString()}).eq("user_id",auth.userId).then(function(){});
      }
      return next;
    });
    if(!was&&!isPro){addNotif({id:"notif_follow_"+Date.now(),icon:"Users",color:DS.hotel,title:"Nouvel abonne",body:"Un utilisateur suit maintenant votre etablissement.",time:"maintenant",read:false,tab:"feed",prefKey:"follow"});}
    tk.show(was?"Vous ne suivez plus cet etablissement":"Vous suivez cet etablissement","success");
  }
  function toggleFavEstab(id){
    var wasFav=favEstabIds.indexOf(id)>=0;
    setFavEstabIds(function(f){
      var next=wasFav?f.filter(function(x){return x!==id;}):f.concat([id]);
      try{localStorage.setItem("hp_fav_estabs",JSON.stringify(next));}catch(e){}
      if(DataLayer._client&&auth&&auth.userId){
        DataLayer._client.from("profiles").update({fav_estabs:next,updated_at:new Date().toISOString()}).eq("user_id",auth.userId).then(function(){});
      }
      return next;
    });
    tk.show(wasFav?"Retiré des favoris":"Ajouté aux favoris","success");
  }

  // Logout - defini avant le routing pour eviter reference error
  async function logout(){
    await AuthService.logout();
    try{localStorage.removeItem("hp_acc_type");}catch(e){}
    setAuth(null);setEstab(null);setBook(null);
    setSett(false);setNotifs(false);
    setCTab("feed");setPTab("feed");
    setNeedsOnboarding(true);
    setCoverPhotoRaw(null);try{localStorage.removeItem("hp_cover_photo");}catch(e){}
  }
  // Suppression de compte RGPD Art. 17 : efface toutes les donnees locales + Supabase + Storage
  async function deleteAccount(){
    var sb = (typeof window!=="undefined" && window.__supabase) ? window.__supabase : null;
    var userId = auth && auth.userId;

    // 1. Suppression Storage : dossier photo profil — on attend la fin avant de continuer
    if(sb && userId){
      try{
        var listRes = await sb.storage.from("profile-photos").list(userId+"/");
        if(listRes.data && listRes.data.length>0){
          var paths = listRes.data.map(function(f){ return userId+"/"+f.name; });
          await sb.storage.from("profile-photos").remove(paths);
        }
      }catch(e){ console.warn("[RGPD] Storage cleanup error:", e); }
    }

    // 2. Suppression Supabase via RPC delete_user_account() (SECURITY DEFINER)
    //    Efface en cascade : reviews, reservations, profiles, posts, messages, auth.users
    if(sb){
      try{ await sb.rpc("delete_user_account"); }catch(e){ console.warn("[RGPD] RPC error:", e); }
    }

    // 3. Efface TOUTES les cles localStorage prefixees "hp_" (robuste aux futures features)
    try{
      var keysToRemove = Object.keys(localStorage).filter(function(k){ return k.startsWith("hp_"); });
      keysToRemove.forEach(function(k){ try{localStorage.removeItem(k);}catch(e){} });
    }catch(e){}

    // 4. Deconnexion Supabase Auth
    try{ await AuthService.logout(); }catch(e){}

    // 5. Reset complet de l'etat React
    setProfilePhotoRaw(null);
    setAuth(null);setEstab(null);setBook(null);
    setSett(false);setNotifs(false);
    setCTab("feed");setPTab("feed");
    setNeedsOnboarding(true);
  }

  // Profil Pro : charge depuis Supabase apres connexion
  var sProProfile=useState(null);var proProfile=sProProfile[0];var setProProfile=sProProfile[1];
  var sProProfLoaded=useState(false);var proProfLoaded=sProProfLoaded[0];var setProProfLoaded=sProProfLoaded[1];
  var sShowProOB=useState(false);var showProOB=sShowProOB[0];var setShowProOB=sShowProOB[1];
  var _authForProf=s0[0]; // ref au auth brut avant re-assignation
  useEffect(function(){
    if(!_authForProf||!_authForProf.userId||_authForProf.type==="client"){setProProfLoaded(true);return;}
    var client=DataLayer._client;
    if(!client){setProProfLoaded(true);return;}
    client.from("profiles").select("*").eq("user_id",_authForProf.userId).maybeSingle()
      .then(function(res){
        if(res.data&&res.data.display_name){setProProfile(res.data);setShowProOB(false);}
        else{setShowProOB(true);}
        setProProfLoaded(true);
      }).catch(function(){setProProfLoaded(true);});
  },[_authForProf&&_authForProf.userId]);

  // === ROUTING =====================================================

  // Mode dev : court-circuit l'auth + sélecteur de compte visible dans l'app
  var sDevType=useState(DEV_ACCOUNT_TYPE);var devType=sDevType[0];var setDevType=sDevType[1];
  var _resolvedAuth = auth;
  if(!auth && DEV_BYPASS_AUTH){
    _resolvedAuth = AuthService.buildSession(devType, "active", "demo@hotelplatform.travel", "dev-user-001");
  }

  if(!_resolvedAuth){
    if(needsOnboarding){
      return(<AccountTypeScreen onSelect={function(t){try{localStorage.setItem("hp_acc_type",t);}catch(e){}setNeedsOnboarding(false);}}/>);
    }
    var _storedAccType="client";try{_storedAccType=localStorage.getItem("hp_acc_type")||"client";}catch(e){}
    return(
      <AuthScreen initialAccType={_storedAccType} onAuth={function(t,status,email,userId){
        try{localStorage.setItem("hp_acc_type",t);}catch(e){}
        setAuth(AuthService.buildSession(t,status,email,userId));
      }} onBack={function(){try{localStorage.removeItem("hp_acc_type");}catch(e){}setNeedsOnboarding(true);}}/>
    );
  }

  var auth=_resolvedAuth; // alias final — écrase le useState auth si dev bypass actif

  var BLOCKED_STATUSES=["pending","suspended","banned","refused","disabled"];
  if(BLOCKED_STATUSES.indexOf(auth.accountStatus)>=0){
    return <AccountStatusScreen auth={auth} onLogout={logout}/>;
  }

  var isPro  = auth.type!=="client";
  var accent = rC(auth.type);
  // Afficher l'onboarding Pro si necessaire (premiere connexion)
  if(isPro&&proProfLoaded&&showProOB){
    return(<div style={{height:"100%",fontFamily:"'DM Sans','Inter',sans-serif"}}><ProOnboarding auth={auth} onComplete={function(prof){setProProfile(prof);setShowProOB(false);}}/></div>);
  }
  var _fallbackProD=auth.type==="hotel"?DataLayer.getHotels()[0]:DataLayer.getRestaurants()[0];
  var proD=proProfile&&proProfile.display_name?{
    id:auth.userId,userId:auth.userId,
    name:proProfile.display_name,author:proProfile.display_name,
    type:auth.type,svcMode:proProfile.svc_mode||auth.type,
    location:proProfile.location||"",description:proProfile.description||"",
    img:proProfile.cover_url||_fallbackProD.img,
    verified:proProfile.verified||false,
    services:_fallbackProD.services||[],rooms:_fallbackProD.rooms||[],offers:_fallbackProD.offers||[]
  }:_fallbackProD;
  var _defaultNotifList = isPro ? NP_DATA : NC_DATA;
  var notifList = _notifStored !== null ? _notifStored : _defaultNotifList;
  function markNotifRead(id){var next=notifList.map(function(n){return n.id===id?Object.assign({},n,{read:true}):n;});setNotifStored(next);try{localStorage.setItem("hp_notifs",JSON.stringify(next));}catch(e){}}
  function addNotif(notif){if(!notifPrefs[notif.prefKey!==undefined?notif.prefKey:"reservation"])return;var next=[notif].concat(notifList);setNotifStored(next);try{localStorage.setItem("hp_notifs",JSON.stringify(next));}catch(e){}}
  var unread = notifList.filter(function(n){return !n.read;}).length;

  function openProf(id,type){
    var l=type==="hotel"?DataLayer.getHotels():DataLayer.getRestaurants();
    setEstab(l.find(function(e){return e.id===id;})||l[0]);
  }
  function openChat(e){
    // Vérifier la permission de messagerie (réglage confidentialité Premium)
    if(!isPro&&privacySettings&&privacySettings.msgPermission==="none"){
      toastApp("Vous avez bloqué tous les messages. Modifiez vos paramètres de confidentialité.","error");
      return;
    }
    // Creer la conversation en base si l'etablissement est un vrai Pro inscrit
    if(e&&e.userId&&auth&&auth.userId&&!isPro&&DataLayer._client){
      var convId=[auth.userId,e.userId].sort().join("_");
      var clientName=clientDisplayName||(auth.email||"").split("@")[0];
      DataLayer._client.from("conversations").upsert([{
        id:convId,client_id:auth.userId,pro_id:e.userId,
        client_name:clientName,pro_name:e.name||e.author||"",
        pro_img:e.img||null,pro_verified:e.verified||false,pro_type:e.type||"hotel"
      }],{onConflict:"id"}).then(function(){});
    }
    setEstab(null);
    if(!isPro)setCTab("chat");else setPTab("chat");
  }

  if(showChangeEmail) return <ChangeEmailModal accent={accent} onClose={function(){setShowChangeEmail(false);}}/>;
  if(showChangePwd)   return <ChangePwdModal accent={accent} onClose={function(){setShowChangePwd(false);}} onSuccess={function(){toastApp("Mot de passe mis à jour avec succes","success");}}/>;
  if(sett)       return <Ov onClose={function(){setSett(false);}}>{function(close){return <SettingsS onBack={close} accType={auth.type} onLogout={logout} onDeleteAccount={deleteAccount} onPremium={function(){setSett(false);setShowPremium(true);}} onPrivacy={function(){setSett(false);setShowPrivacy(true);}} isPremium={isPremium} premiumData={premiumData} onChangeEmail={function(){setSett(false);setShowChangeEmail(true);}} onChangePwd={function(){setSett(false);setShowChangePwd(true);}} notifPrefs={notifPrefs} onUpdateNotifPrefs={updateNotifPrefs}/>;}}</Ov>;
  // === BANDEAU DEV (visible uniquement si DEV_BYPASS_AUTH = true) ===
  var devBanner=DEV_BYPASS_AUTH?(
    <div style={{background:"#1a1a00",borderBottom:"1px solid #F59E0B55",padding:"6px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexShrink:0}}>
      <span style={{fontSize:10,color:"#F59E0B",fontWeight:800}}>⚠ MODE TEST v14</span>
      <div style={{display:"flex",gap:4}}>
        {[["client","Client"],["hotel","Hôtel"],["restaurant","Resto"]].map(function(_i){
          var t=_i[0];var l=_i[1];var isAct=devType===t;
          return <button key={t} onClick={function(){setDevType(t);setAuth(null);}} style={{padding:"3px 10px",borderRadius:20,border:"1px solid "+(isAct?"#F59E0B":"#444"),background:isAct?"#F59E0B":"transparent",color:isAct?"#000":"#F59E0B",fontSize:10,fontWeight:800,cursor:"pointer"}}>{l}</button>;
        })}
      </div>
    </div>
  ):null;

  // === HEADER RIGHT (notifications + offline toggle) ===============
  var headerRight=(
    <div style={{display:"flex",gap:14,alignItems:"center"}}>
      <button onClick={function(){setOff(function(o){return !o;});}} style={{background:"none",border:"none",cursor:"pointer",display:"flex",padding:4}}>
        <Activity size={16} color={offline?DS.error:DS.textDim}/>
      </button>
      <button onClick={function(){setNotifs(true);}} style={{background:"none",border:"none",cursor:"pointer",position:"relative",display:"flex",padding:4}}>
        <Bell size={18} color={DS.textMuted}/>
        {unread>0&&<span style={{position:"absolute",top:-4,right:-4,minWidth:16,height:16,borderRadius:8,background:DS.error,border:"2px solid "+DS.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#fff",padding:"0 3px"}}>{unread}</span>}
      </button>
    </div>
  );

  // === CLIENT VIEW ================================================
  if(!isPro){
    var cTabs=[
      {id:"feed",        icon:Home,          label:"Accueil"},
      {id:"discover",    icon:Search,        label:"Découverte"},
      {id:"chat",        icon:MessageCircle, label:"Messages"},
      {id:"profile",     icon:User,          label:"Profil"},
    ];
    return(
      <div style={{height:"100%",background:DS.bg,fontFamily:"'DM Sans','Inter','Segoe UI',sans-serif",display:"flex",flexDirection:"column",maxWidth:420,margin:"0 auto",position:"relative"}}>
        <TopBar
          left={<div style={{fontSize:16,fontWeight:900,color:DS.text,letterSpacing:-0.5}}>HotelPlatform <span style={{color:DS.client}}>Travel</span></div>}
          right={headerRight}
        />
        {devBanner}
        {offline&&<div style={{background:DS.error+"18",borderBottom:"1px solid "+DS.error+"33",padding:"6px 16px",fontSize:11,color:DS.error,fontWeight:700,textAlign:"center"}}>Vous êtes hors ligne</div>}
        <div key={cTab} style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",touchAction:"pan-y",animation:"hp-fade-up 0.34s cubic-bezier(0.22,1,0.36,1)"}}>
          {cTab==="feed"     &&<div>{!isPremium&&<AdBanner/>}<ClientFeed onProfile={openProf} followingIds={followingIds} onToggleFollow={toggleFollowGlobal} selfEmail={auth&&auth.email} selfUserId={auth&&auth.userId} onAddNotif={addNotif} isPremium={isPremium} selfName={clientDisplayName||(auth&&auth.email?auth.email.split("@")[0]:"Vous")}/></div>}
          {cTab==="discover" &&<ClientDisc onProfile={openProf} onBook={function(e){setBook(e);}}/>}
          {cTab==="chat"     &&<ChatUI chats={DataLayer.getClientChats()} myColor={DS.client} nK="pN" iK="pI" vK="pV" isClientChat={true} myId={auth&&auth.userId} myName={clientDisplayName||(auth&&auth.email?auth.email.split("@")[0]:"Vous")}/>}
          {cTab==="profile"  &&<ClientProf onSettings={function(){setSett(true);}} onPremium={function(){setShowPremium(true);}} isPremium={isPremium} premiumData={premiumData} onRenewPremium={renewPremium} onPrivacy={function(){setShowPrivacy(true);}} resaHistory={resaHistory} followingCount={followingIds.length} selfEmail={auth&&auth.email} authUserId={auth&&auth.userId} favEstabIds={favEstabIds} privacySettings={privacySettings} profilePhoto={profilePhoto} onPhotoChange={setProfilePhoto} onNameChange={_onClientNameChange}/>}
        </div>
        <BotNav tabs={cTabs} active={cTab} set={setCTab} accent={DS.client}/>
        {estab&&<EstabM e={estab} onClose={function(){setEstab(null);}} onBook={function(bookingData){setBook(bookingData||estab);setEstab(null);}} onChat={openChat} followingIds={followingIds} onToggleFollow={toggleFollowGlobal} favEstabIds={favEstabIds} onToggleFavEstab={toggleFavEstab} viewerIsPro={false} selfUserId={auth&&auth.userId}/>}
        {book&&<BookM e={book} onClose={function(){setBook(null);}} selfEmail={auth&&auth.email} selfUserId={auth&&auth.userId} selfName={clientDisplayName||(auth&&auth.email?auth.email.split("@")[0]:"Client")} onBooked={function(resa){setResaHistory(function(h){var next=BookingService.appendToHistory(h,resa);try{localStorage.setItem("hp_resas",JSON.stringify(next));}catch(e){}return next;});addNotif({id:"notif_resa_"+Date.now(),icon:"Calendar",color:DS.primary,title:"Réservation confirmée",body:"Votre réservation chez "+(resa.estab||"l'établissement")+" est enregistrée.",time:"maintenant",read:false,tab:"profile",prefKey:"reservation"});setBook(null);}}/>}
        {showPremium&&<PremiumModal accType={auth.type} onClose={function(){setShowPremium(false);}} onSubscribe={subscribePremium}/>}
        {showPrivacy&&<PrivacyModal accType={auth.type} isPremium={isPremium} onPremium={function(){setShowPrivacy(false);setShowPremium(true);}} onClose={function(){setShowPrivacy(false);}} settings={privacySettings} onUpdate={updatePrivacy}/>}
        {notifsOpen&&<Ov onClose={function(){setNotifs(false);}}>{function(close){return <NotifP isPro={isPro} accent={accent} notifs={notifList} onMarkRead={markNotifRead} onBack={close} onNavigate={function(t){setNotifs(false);setCTab(t);}}/>;}}</Ov>}
        {showSplashAd&&!isPremium&&<SplashAd onClose={closeSplashAd}/>}
        <Toast/>
      </div>
    );
  }

  // === PRO VIEW ===================================================
  var pTabs = auth.type==="hotel"
    ? [{id:"feed",         icon:Home,          label:"Accueil"},
       {id:"services",     icon:Package,       label:"Services"},
       {id:"reservations", icon:Calendar,      label:"Réservations"},
       {id:"chat",         icon:MessageCircle, label:"Messages"},
       {id:"profile",      icon:User,          label:"Profil"}]
    : [{id:"feed",         icon:Home,          label:"Accueil"},
       {id:"offres",       icon:Tag,           label:"Offres"},
       {id:"reservations", icon:Calendar,      label:"Réservations"},
       {id:"chat",         icon:MessageCircle, label:"Messages"},
       {id:"profile",      icon:User,          label:"Profil"}];

  return(
    <div style={{height:"100%",background:DS.bg,fontFamily:"'DM Sans','Inter','Segoe UI',sans-serif",display:"flex",flexDirection:"column",maxWidth:420,margin:"0 auto",position:"relative"}}>
      <TopBar
        left={
          <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
            <span style={{fontSize:14,fontWeight:900,color:DS.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{proD.name}</span>
            {proD.verified&&<VBadge sz={14}/>}
          </div>
        }
        right={headerRight}
      />
      {devBanner}
      {offline&&<div style={{background:DS.error+"18",borderBottom:"1px solid "+DS.error+"33",padding:"6px 16px",fontSize:11,color:DS.error,fontWeight:700,textAlign:"center"}}>Vous êtes hors ligne</div>}
      <div key={pTab} style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",touchAction:"pan-y",animation:"hp-fade-up 0.34s cubic-bezier(0.22,1,0.36,1)"}}>
        {pTab==="feed"         &&<div>{!isPremium&&<AdBanner/>}<ProFeed proType={auth.type} isPremium={isPremium} onPremium={function(){setShowPremium(true);}} onProfile={openProf} followingIds={followingIds} onToggleFollow={toggleFollowGlobal} selfEmail={auth&&auth.email} selfUserId={auth&&auth.userId} onAddNotif={addNotif}/></div>}
        {pTab==="services"     &&<HotelSvc data={proD} userId={auth&&auth.userId}/>}
        {pTab==="offres"       &&<RestOff data={proD}/>}
        {pTab==="reservations" &&<ProResa proType={auth.type} onOpenChat={function(){setPTab("chat");}} clientPrivacySettings={privacySettings} selfEmail={auth&&auth.email}/>}
        {pTab==="chat"         &&<ChatUI chats={DataLayer.getProChats()} myColor={accent} nK="cN" vK="cV" isClientChat={false} qR={["Bonjour, disponible !","Je confirme","Veuillez nous appeler","Merci pour votre message"]} myId={auth&&auth.userId} myName={auth&&(auth.email||"").split("@")[0]}/>}
        {pTab==="profile"      &&<ProProf proType={auth.type} authUserId={auth&&auth.userId} onSettings={function(){setSett(true);}} onPremium={function(){setShowPremium(true);}} isPremium={isPremium} premiumData={premiumData} onRenewPremium={renewPremium} onPrivacy={function(){setShowPrivacy(true);}} profilePhoto={profilePhoto} onPhotoChange={setProfilePhoto} coverPhoto={coverPhoto} onCoverChange={setCoverPhoto}/>}
      </div>
      <BotNav tabs={pTabs} active={pTab} set={setPTab} accent={accent}/>
      {estab&&<EstabM e={estab} onClose={function(){setEstab(null);}} onBook={function(bookingData){setBook(bookingData||estab);setEstab(null);}} onChat={openChat} followingIds={followingIds} onToggleFollow={toggleFollowGlobal} favEstabIds={favEstabIds} onToggleFavEstab={toggleFavEstab} viewerIsPro={true} selfUserId={auth&&auth.userId}/>}
      {book&&<BookM e={book} onClose={function(){setBook(null);}} selfEmail={auth&&auth.email} selfUserId={auth&&auth.userId} onBooked={function(resa){setResaHistory(function(h){var next=BookingService.appendToHistory(h,resa);try{localStorage.setItem("hp_resas",JSON.stringify(next));}catch(e){}return next;});addNotif({id:"notif_resa_"+Date.now(),icon:"Calendar",color:DS.primary,title:"Réservation confirmée",body:"Votre réservation chez "+(resa.estab||"l'établissement")+" est enregistrée.",time:"maintenant",read:false,tab:"reservations",prefKey:"reservation"});setBook(null);}}/>}
      {showPremium&&<PremiumModal accType={auth.type} onClose={function(){setShowPremium(false);}} onSubscribe={subscribePremium}/>}
      {showPrivacy&&<PrivacyModal accType={auth.type} isPremium={isPremium} onPremium={function(){setShowPrivacy(false);setShowPremium(true);}} onClose={function(){setShowPrivacy(false);}} settings={privacySettings} onUpdate={updatePrivacy}/>}
      {notifsOpen&&<Ov onClose={function(){setNotifs(false);}}>{function(close){return <NotifP isPro={isPro} accent={accent} notifs={notifList} onMarkRead={markNotifRead} onBack={close} onNavigate={function(t){setNotifs(false);setPTab(t);}}/>;}}</Ov>}
      {showSplashAd&&!isPremium&&<SplashAd onClose={closeSplashAd}/>}
      <Toast/>
    </div>
  );
}
