import { useState, useEffect, useRef } from "react";
import {
  Home, Search, MessageCircle, User, Bell, Settings, Star, Heart,
  Share2, Link2, MapPin, ArrowLeft, X, Plus, Trash2, Edit2, Eye, Calendar,
  CreditCard, Users, AlertTriangle, LogOut, Lock, Mail, Send,
  MoreVertical, CheckCircle, XCircle, ChevronRight, FileText, Flag, Activity,
  Building2, Utensils, Shield, ShieldCheck, Phone, Package, Waves,
  EyeOff, Car, Dumbbell, Tag, Wifi, Bookmark, Clock, UserPlus, UserCheck
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
function fmtK(n){
  if(n===null||n===undefined)return"0";
  if(n>=1000000){var m=Math.round(n/100000)/10;return(m%1===0?m.toFixed(0):m)+"M";}
  if(n>=1000){var k=Math.round(n/100)/10;return(k%1===0?k.toFixed(0):k)+"k";}
  return String(n);
}

const ANIM_CSS="@keyframes hp-fade-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes hp-slide-right{from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:translateX(0)}}@keyframes hp-slide-out-right{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(40px)}}@keyframes hp-slide-up{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes hp-scale-in{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}@keyframes hp-fade{from{opacity:0}to{opacity:1}}@keyframes hp-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}button{transition:opacity .18s cubic-bezier(0.22,1,0.36,1),transform .16s cubic-bezier(0.22,1,0.36,1),background .2s ease}button:active{transform:scale(.96);opacity:.85}.hp-scroll{-webkit-overflow-scrolling:touch}";
function useAnimations(){useEffect(function(){if(document.getElementById("hp-a"))return;var s=document.createElement("style");s.id="hp-a";s.textContent=ANIM_CSS;document.head.appendChild(s);},[]);}

const HOTELS=[
  {id:"h1",name:"Grand Hotel Royal",type:"hotel",location:"Dakar, Senegal",img:"https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=70",rating:4.9,reviewCount:1284,priceFrom:120,followers:2341,verified:false,isPremium:false,hasRestaurant:true,svcMode:"combined",description:"Hotel 5 etoiles au coeur de Dakar. Vue mer exceptionnelle, spa luxueux.",services:[{id:"svc1",name:"Spa",active:true},{id:"svc2",name:"Restaurant Gastronomique",active:true},{id:"svc3",name:"Piscine Infinity",active:true},{id:"svc4",name:"Salle de conference",active:true},{id:"svc5",name:"Navette aeroport",active:true},{id:"svc6",name:"Room Service 24h",active:true}],rooms:[{id:"r1",name:"Suite Presidentielle",price:450,capacity:2,available:true,stock:3},{id:"r2",name:"Chambre Superieure",price:240,capacity:2,available:true,stock:6},{id:"r3",name:"Chambre Deluxe",price:180,capacity:2,available:false,stock:0}],menu:[{cat:"Entrees",items:[{name:"Salade Cesar",price:14,description:"Poulet grille, parmesan, croutons"},{name:"Soupe du jour",price:9,description:"Selon arrivage du marche"}]},{cat:"Plats",items:[{name:"Thiof grille",price:28,description:"Poisson local, riz, legumes"},{name:"Filet de boeuf",price:34,description:"Sauce au poivre, frites maison"}]}],meals:[{id:"breakfast",name:"Petit-dejeuner",price:12},{id:"lunch",name:"Dejeuner",price:18},{id:"dinner",name:"Diner",price:25}]},
  {id:"h2",name:"Savane Lodge",type:"hotel",location:"Nairobi, Kenya",img:"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=70",rating:4.6,reviewCount:643,priceFrom:89,followers:876,verified:true,isPremium:false,description:"Lodge authentique en pleine nature. Safari experience unique.",services:["Safari Guide","Restaurant","Piscine","Connexion WiFi"],rooms:[{id:"r3",name:"Bungalow Safari",price:89,capacity:2,available:true},{id:"r4",name:"Villa Familiale",price:180,capacity:4,available:true}]},
];
const RESTAURANTS=[
  {id:"res1",name:"Le Jardin Gourmand",type:"restaurant",location:"Abidjan, CI",img:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=70",rating:4.8,reviewCount:2341,priceFrom:15,followers:3210,verified:false,isPremium:false,description:"Cuisine africaine contemporaine. Produits locaux selectionnes.",offers:["Menu Decouverte 35 EUR","Brunch Dominical 28 EUR","Menu Business 22 EUR"],menu:[{cat:"Entrees",items:[{name:"Thieboudienne Royal",price:18},{name:"Yassa Poulet",price:16}]},{cat:"Plats",items:[{name:"Attieke Poisson",price:22},{name:"Kedjenou",price:20}]},{cat:"Desserts",items:[{name:"Thiakry",price:8},{name:"Banane Flambe",price:10}]}]},
  {id:"res2",name:"Chez Mamie Fatou",type:"restaurant",location:"Bamako, Mali",img:"https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=70",rating:4.7,reviewCount:1876,priceFrom:8,followers:1540,verified:false,isPremium:false,description:"Cuisine malienne authentique. Ambiance familiale.",offers:["Plat du Jour 8 EUR","Menu Complet 14 EUR"],menu:[{cat:"Plats",items:[{name:"Riz au Gras",price:8},{name:"To Sauce Arachide",price:10}]},{cat:"Boissons",items:[{name:"Bissap",price:2},{name:"Gingembre",price:2}]}]},
];
const CC=[
  {pN:"Grand Hotel Royal",pI:"https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=60&q=70",pV:true,messages:[{id:1,f:"them",t:"Bonjour, votre reservation est confirmee pour le 24 juillet.",time:"10:30",read:true},{id:2,f:"me",t:"Merci beaucoup !",time:"10:34",read:true},{id:3,f:"them",t:"Avez-vous des preferences alimentaires ?",time:"10:35",read:false}]},
  {pN:"Le Jardin Gourmand",pI:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=60&q=70",pV:true,messages:[{id:4,f:"them",t:"Merci pour votre avis ! Nous serons ravis de vous revoir.",time:"09:00",read:true}]},
];
const CP=[
  {cN:"Moussa Konate",cV:false,messages:[{id:10,f:"them",t:"Bonjour, je voudrais reserver une chambre pour 2 personnes.",time:"14:00",read:false}]},
  {cN:"Aicha Mbaye",cV:false,messages:[{id:11,f:"them",t:"Est-ce que le spa est ouvert le dimanche ?",time:"09:30",read:true}]},
];
const FEED=[
  {id:"h1",author:"Grand Hotel Royal",type:"hotel",time:"2h",img:"https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=70",text:"Decouvrez notre nouvelle suite presidentielle renovee ! Vue mer panoramique.",likes:284,comments:12,shares:18,followers:2341,verified:true,combined:true},
  {id:"res1",author:"Le Jardin Gourmand",type:"restaurant",time:"4h",img:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=70",text:"Menu special ce soir : Homard grille aux epices africaines. Reservation recommandee !",likes:512,comments:34,shares:47,followers:3210,verified:true},
  {id:"h2",author:"Savane Lodge",type:"hotel",time:"6h",img:"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=70",text:"Safari au lever du soleil - des moments inoubliables.",likes:156,comments:8,shares:9,followers:876,verified:true},
  {id:"res2",author:"Chez Mamie Fatou",type:"restaurant",time:"8h",img:"https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=70",text:"Aujourd hui : Thieboudienne special avec poissons du jour.",likes:89,comments:5,shares:4,followers:1540,verified:false},
];
const AD={active:true,label:"PUBLICITE",text:"Decouvrez nos etablissements partenaires"};

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
    ad: AD
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
  getCurrentClientName: function(){ return "Moussa Konate"; },

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
      estab: resa.estab, estab_type: resa.estabType,
      status: resa.status, data: resa
    }]);
  },
  // Enregistre un message dans Supabase
  saveMessage: function(conversationId, msg){
    return DataLayer.create("messages", [{
      conversation_id: conversationId, sender: msg.f,
      body: msg.t, deleted: !!msg.deleted, read: !!msg.read,
      reply_to: msg.replyTo || null
    }]);
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
      return AuthService.buildSession(accType, "active", r.data.user.email, r.data.user.id);
    }
    return AuthService.buildSession(accType, "active", email || "demo@platform.com");
  },
  register: async function(accType, email, password){
    var sb = AuthService._sb();
    if(sb){
      var r = await sb.auth.signUp({ email: email, password: password, options: { data: { account_type: accType } } });
      if(r.error) throw r.error;
      var status = accType !== "client" ? "pending" : "active";
      var s = AuthService.buildSession(accType, status, (r.data.user&&r.data.user.email)||email, r.data.user&&r.data.user.id);
      s.needsEmailConfirm = !r.data.session;
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
  createBooking: function(resa){
    if(!resa) return null;
    if(!resa.id){ resa.id = BookingService.generateId(); }
    if(!resa.createdAt){ resa.createdAt = new Date().toISOString(); }
    BookingService._all.push(resa);
    try{localStorage.setItem("hp_resas_all",JSON.stringify(BookingService._all));}catch(e){}
    try{ if(DataLayer._client){ DataLayer.saveReservation(resa).then(function(){}); } }catch(e){}
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
      ? Object.assign({}, msg, { deleted: true, t: "[Message supprime]" })
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
    var bg={success:DS.success,error:DS.error,info:DS.info,warning:DS.warning}[toast.type]||DS.card;
    return(<div onClick={function(){setToast(null);}} style={{position:"fixed",bottom:88,left:"50%",transform:"translateX(-50%)",zIndex:9999,background:bg,color:"#fff",padding:"10px 22px",borderRadius:30,fontSize:13,fontWeight:700,whiteSpace:"nowrap",cursor:"pointer"}}>{toast.msg}</div>);
  }
  return {show:show,Toast:Toast};
}

function VBadge(props){var sz=props.sz||22;return(<svg width={sz} height={sz} viewBox="0 0 24 24" fill="none"><defs><linearGradient id="vbg" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#FFD700"/><stop offset="100%" stopColor="#D97706"/></linearGradient></defs><path d="M12 2L14.09 8.26L20.73 8.27L15.45 12.14L17.54 18.4L12 14.52L6.46 18.4L8.55 12.14L3.27 8.27L9.91 8.26Z" fill="url(#vbg)" stroke="#D97706" strokeWidth="0.5"/><path d="M9 12L11 14L15 10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>);}
function BackBtn(props){
  var onClick=props.onClick;var light=props.light||false;
  var iconColor=light?"#fff":DS.text;
  var bg=light?"rgba(0,0,0,.45)":DS.card;
  var bd=light?"rgba(255,255,255,.18)":DS.border;
  return(<button onClick={onClick} style={{background:bg,border:"1px solid "+bd,borderRadius:"50%",width:38,height:38,minWidth:38,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:0,flexShrink:0,boxShadow:light?"0 2px 8px rgba(0,0,0,.3)":"0 1px 3px rgba(0,0,0,.4)"}}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 5L8 12L15 19" stroke={iconColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
  </button>);
}

function Av(props){
  var sz=props.sz||40;var letter=props.letter||"?";var img=props.img||null;var verified=props.verified||false;
  return(<div style={{position:"relative",width:sz,height:sz,flexShrink:0}}>{img?<img src={img} alt="" style={{width:sz,height:sz,borderRadius:"50%",objectFit:"cover"}}/>:<div style={{width:sz,height:sz,borderRadius:"50%",background:DS.primary+"30",display:"flex",alignItems:"center",justifyContent:"center",fontSize:Math.round(sz*.4),fontWeight:800,color:DS.primary}}>{letter}</div>}{verified&&<div style={{position:"absolute",bottom:-2,right:-2,background:DS.bg,borderRadius:"50%",padding:1}}><VBadge sz={Math.round(sz*.36)}/></div>}</div>);
}

function Stars(props){var r=props.r||0;var sz=props.sz||14;return(<span style={{display:"inline-flex",gap:2}}>{[1,2,3,4,5].map(function(i){return <Star key={i} size={sz} fill={i<=r?"#F59E0B":"none"} color={i<=r?"#F59E0B":DS.border} strokeWidth={1.5}/>;})}</span>);}

function Emp(props){var Icon=props.Icon||Package;var title=props.title||"";var sub=props.sub||"";return(<div style={{padding:"48px 20px",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:10}}><Icon size={40} color={DS.textDim} strokeWidth={1}/><div style={{fontSize:15,fontWeight:700,color:DS.textMuted}}>{title}</div>{sub&&<div style={{fontSize:12,color:DS.textDim,maxWidth:240}}>{sub}</div>}</div>);}

function AdBanner(){var AD=DataLayer.getAd();if(!AD.active)return null;return(<div style={{margin:"6px 14px",padding:"7px 14px",background:DS.primarySoft,border:"1px solid "+DS.primary+"22",borderRadius:10,display:"flex",alignItems:"center",gap:8}}><Tag size={11} color={DS.primary}/><span style={{fontSize:9,fontWeight:800,color:DS.primary,letterSpacing:1}}>{AD.label} </span><span style={{fontSize:11,color:DS.textMuted}}>{AD.text}</span></div>);}

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
  return(<div style={{position:"sticky",bottom:0,background:DS.surface,borderTop:"1px solid "+DS.border,display:"flex",zIndex:100}}>{tabs.map(function(tab){var Icon=tab.icon;var id=tab.id;var isAct=active===id;return(<button key={id} onClick={function(){if(id==="feed"&&isAct&&onHomeRefresh)onHomeRefresh();else set(id);}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"8px 0 6px",background:"none",border:"none",cursor:"pointer",gap:2}}><Icon size={22} color={isAct?accent:DS.textMuted} strokeWidth={isAct?2.5:1.5}/><div style={{fontSize:9,fontWeight:isAct?700:400,color:isAct?accent:DS.textMuted}}>{tab.label}</div><div style={{width:isAct?16:0,height:2,borderRadius:1,background:accent,transition:"width 0.2s ease",overflow:"hidden"}}/></button>);})}</div>);
}

function Ov(props){
  var onClose=props.onClose;
  var sc=useState(false);var closing=sc[0];var setClosing=sc[1];
  function handleClose(){
    if(closing)return;
    setClosing(true);
    setTimeout(function(){if(onClose)onClose();},260);
  }
  return(<div style={{position:"fixed",inset:0,background:DS.bg,zIndex:850,maxWidth:420,margin:"0 auto",overflowY:"auto",animation:(closing?"hp-slide-out-right 0.26s cubic-bezier(0.4,0,1,1) forwards":"hp-slide-right 0.32s cubic-bezier(0.22,1,0.36,1)"),boxShadow:"-8px 0 24px rgba(0,0,0,.35)"}}>{typeof props.children==="function"?props.children(handleClose):props.children}</div>);
}

function AuthScreen(props){
  var onAuth=props.onAuth;
  var s1=useState("login");var mode=s1[0];var setMode=s1[1];
  var s2=useState("client");var accType=s2[0];var setAccType=s2[1];
  var s3=useState("");var email=s3[0];var setEmail=s3[1];
  var s4=useState("");var pass=s4[0];var setPass=s4[1];
  var s5=useState(false);var showP=s5[0];var setShowP=s5[1];
  var s6=useState(false);var twoFA=s6[0];var setTwoFA=s6[1];
  var s7=useState("");var faCode=s7[0];var setFACode=s7[1];
  var s8=useState(false);var cgu=s8[0];var setCgu=s8[1];
  var s9=useState("email");var faMethod=s9[0];var setFAMethod=s9[1];
  var s10=useState(false);var loading=s10[0];var setLoading=s10[1];
  var s11=useState("");var authErr=s11[0];var setAuthErr=s11[1];
  var s12=useState("");var confirmPass=s12[0];var setConfirmPass=s12[1];
  var s13=useState(false);var emailPending=s13[0];var setEmailPending=s13[1];
  var s14=useState("");var formErr=s14[0];var setFormErr=s14[1];
  function submit(){
    setFormErr("");
    if(mode!=="forgot"&&!email.trim()){setFormErr("Veuillez saisir votre email.");return;}
    var emailRe=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRe.test(email.trim())){setFormErr("Adresse email invalide.");return;}
    if(mode!=="forgot"&&pass.length<6){setFormErr("Le mot de passe doit contenir au moins 6 caracteres.");return;}
    if(mode!=="forgot"&&pass.length>72){setFormErr("Le mot de passe est trop long (maximum 72 caracteres).");return;}
    if(mode==="register"&&pass!==confirmPass){setFormErr("Les mots de passe ne correspondent pas.");return;}
    if(mode==="register"&&!cgu){setFormErr("Veuillez accepter les conditions d utilisation.");return;}
    setTwoFA(true);setAuthErr("");
  }
  async function verify2FA(){
    if(faCode.length===6){
      setLoading(true);setAuthErr("");
      try{
        var session=mode==="register"
          ?await AuthService.register(accType,email,pass)
          :await AuthService.login(accType,email,pass);
        if(session){
          if(session.needsEmailConfirm){
            setEmailPending(true);setTwoFA(false);
          } else {
            onAuth(accType,session.accountStatus,session.email,session.userId);
          }
        }
      }catch(e){
        var msg = e.message||"";
        if(msg.includes("fetch")||msg.includes("network")||msg.includes("ERR_")||msg.includes("Failed to fetch")){
          setAuthErr("Connexion impossible. Verifiez votre connexion internet.");
        } else if(msg.includes("Invalid login")||msg.includes("invalid_credentials")){
          setAuthErr("Email ou mot de passe incorrect.");
        } else if(msg.includes("already registered")||msg.includes("User already registered")){
          setAuthErr("Cet email est deja utilise. Essayez de vous connecter.");
        } else if(msg.includes("longer than 72")||msg.includes("72 characters")){
          setAuthErr("Mot de passe trop long. Maximum 72 caracteres.");
        } else if(msg.includes("Password should be")||msg.includes("password")){
          setAuthErr("Le mot de passe doit contenir entre 6 et 72 caracteres.");
        } else if(msg.includes("Email not confirmed")){
          setAuthErr("Confirmez votre email avant de vous connecter.");
        } else if(msg.includes("rate limit")||msg.includes("too many")){
          setAuthErr("Trop de tentatives. Attendez quelques minutes avant de reessayer.");
        } else {
          setAuthErr(msg||"Erreur de connexion. Veuillez reessayer.");
        }
      }finally{
        setLoading(false);
      }
    }
  }
  if(twoFA){
    return(
      <div style={{minHeight:"100vh",background:DS.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,animation:"hp-fade-up 0.28s ease"}}>
        <div style={{width:"100%",maxWidth:360}}>
          <div style={{textAlign:"center",marginBottom:24}}>
            <div style={{width:64,height:64,borderRadius:"50%",background:DS.primarySoft,border:"2px solid "+DS.primary,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><Shield size={28} color={DS.primary}/></div>
            <div style={{fontSize:20,fontWeight:900,color:DS.text}}>Verification 2FA</div>
            <div style={{fontSize:13,color:DS.textMuted,marginTop:6}}>Code envoye a <span style={{color:DS.primary,fontWeight:700}}>{email||"votre email"}</span></div>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            {[["email","Email"],["sms","SMS"]].map(function(_i){var m=_i[0];var l=_i[1];var isAct=faMethod===m;return <button key={m} onClick={function(){setFAMethod(m);}} style={{flex:1,padding:"8px",borderRadius:10,border:"1px solid "+(isAct?DS.primary:DS.border),background:isAct?DS.primarySoft:"transparent",color:isAct?DS.primary:DS.textMuted,fontSize:12,fontWeight:700,cursor:"pointer"}}>{l}</button>;})}
          </div>
          <input value={faCode} onChange={function(e){setFACode(e.target.value);}} maxLength={6} placeholder="Entrez le code a 6 chiffres" style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:12,padding:"14px",fontSize:20,fontWeight:800,color:DS.text,outline:"none",textAlign:"center",letterSpacing:6,boxSizing:"border-box",marginBottom:12}}/>
          {authErr&&<div style={{background:DS.errorSoft,border:"1px solid "+DS.error+"44",borderRadius:10,padding:"9px 14px",marginBottom:10,fontSize:12,color:DS.error,textAlign:"center"}}>{authErr}</div>}
          <button onClick={verify2FA} disabled={faCode.length<6||loading} style={{width:"100%",padding:"13px",background:faCode.length>=6&&!loading?DS.primary:DS.textDim,border:"none",borderRadius:12,color:"#fff",fontSize:14,fontWeight:800,cursor:faCode.length>=6&&!loading?"pointer":"not-allowed",marginBottom:10,opacity:faCode.length>=6&&!loading?1:.7}}>{loading?"Connexion en cours...":"Valider"}</button>
          <button onClick={function(){setTwoFA(false);setFACode("");}} style={{width:"100%",padding:"10px",background:"transparent",border:"none",color:DS.textMuted,fontSize:12,cursor:"pointer"}}>Retour</button>
        </div>
      </div>
    );
  }
  if(emailPending){
    return(
      <div style={{minHeight:"100vh",background:DS.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,animation:"hp-fade-up 0.28s ease"}}>
        <div style={{width:"100%",maxWidth:360,textAlign:"center"}}>
          <div style={{width:72,height:72,borderRadius:"50%",background:DS.primarySoft,border:"2px solid "+DS.primary,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><Mail size={32} color={DS.primary}/></div>
          <div style={{fontSize:22,fontWeight:900,color:DS.text,marginBottom:10}}>Confirmez votre email</div>
          <div style={{fontSize:14,color:DS.textMuted,lineHeight:1.7,marginBottom:24}}>Un lien de confirmation a ete envoye a <span style={{color:DS.primary,fontWeight:700}}>{email}</span>.<br/>Cliquez sur le lien pour activer votre compte.</div>
          <div style={{background:DS.card,border:"1px solid "+DS.border,borderRadius:12,padding:"12px 16px",marginBottom:20,fontSize:12,color:DS.textMuted,textAlign:"left"}}>
            <div style={{fontWeight:700,color:DS.text,marginBottom:4}}>Vous ne trouvez pas l email ?</div>
            <div>Verifiez vos spams ou dossier promotions. Le lien expire dans 24h.</div>
          </div>
          <button onClick={function(){setEmailPending(false);setMode("login");setTwoFA(false);setFACode("");setPass("");setConfirmPass("");}} style={{width:"100%",padding:"13px",background:DS.primary,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer"}}>Se connecter</button>
        </div>
      </div>
    );
  }
  return(
    <div style={{minHeight:"100vh",background:DS.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,animation:"hp-fade-up 0.28s ease"}}>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:32,fontWeight:900,color:DS.text,letterSpacing:-1}}>HotelPlatform <span style={{color:DS.client}}>Travel</span></div>
        <div style={{fontSize:12,color:DS.textMuted,marginTop:6}}>{mode==="login"?"Connectez-vous":mode==="register"?"Creez votre compte":"Reinitialiser le mot de passe"}</div>
      </div>
      <div style={{width:"100%",maxWidth:360}}>
        {mode!=="forgot"&&(
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
          <input type="email" value={email} onChange={function(ev){setEmail(ev.target.value);}} placeholder="Email ou telephone" style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:12,padding:"13px 16px 13px 38px",fontSize:13,color:DS.text,outline:"none",boxSizing:"border-box"}}/>
        </div>
        {mode!=="forgot"&&(
          <div style={{position:"relative",marginBottom:10}}>
            <Lock size={14} color={DS.textMuted} style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)"}}/>
            <input type={showP?"text":"password"} value={pass} onChange={function(ev){setPass(ev.target.value);}} placeholder="Mot de passe" style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:12,padding:"13px 40px 13px 38px",fontSize:13,color:DS.text,outline:"none",boxSizing:"border-box"}}/>
            <button onClick={function(){setShowP(!showP);}} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",display:"flex"}}><EyeOff size={14} color={DS.textMuted}/></button>
          </div>
        )}
        {mode==="register"&&(
          <div style={{position:"relative",marginBottom:12}}>
            <Lock size={14} color={DS.textMuted} style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)"}}/>
            <input type={showP?"text":"password"} value={confirmPass} onChange={function(ev){setConfirmPass(ev.target.value);}} placeholder="Confirmer le mot de passe" style={{width:"100%",background:DS.card,border:"1px solid "+(confirmPass&&confirmPass!==pass?DS.error:DS.border),borderRadius:12,padding:"13px 16px 13px 38px",fontSize:13,color:DS.text,outline:"none",boxSizing:"border-box"}}/>
          </div>
        )}
        {formErr&&<div style={{background:DS.errorSoft,border:"1px solid "+DS.error+"44",borderRadius:10,padding:"9px 14px",marginBottom:10,fontSize:12,color:DS.error,textAlign:"center"}}>{formErr}</div>}
        {mode==="register"&&accType!=="client"&&<div style={{background:DS.warningSoft,border:"1px solid "+DS.warning+"33",borderRadius:10,padding:"9px 14px",marginBottom:10,fontSize:11,color:DS.warning}}>Les comptes Hotel et Restaurant sont soumis a validation avant activation.</div>}
        {mode==="register"&&(
          <div onClick={function(){setCgu(!cgu);}} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 0",cursor:"pointer",marginBottom:10}}>
            <div style={{width:20,height:20,borderRadius:6,border:"2px solid "+(cgu?DS.primary:DS.border),background:cgu?DS.primary:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
              {cgu&&<CheckCircle size={12} color="#fff"/>}
            </div>
            <span style={{fontSize:12,color:DS.textMuted,lineHeight:1.5}}>J accepte les <span style={{color:DS.primary,fontWeight:700}}>conditions d utilisation</span> et la <span style={{color:DS.primary,fontWeight:700}}>politique de confidentialite</span> de HotelPlatform Travel</span>
          </div>
        )}
        <button onClick={submit} disabled={mode==="register"&&!cgu} style={{width:"100%",padding:"13px",background:mode==="register"&&!cgu?DS.textDim:DS.primary,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",marginBottom:12,opacity:mode==="register"&&!cgu?.6:1}}>
          {mode==="login"?"Se connecter et verifier (2FA)":mode==="register"?"Creer et verifier (2FA)":"Envoyer le lien"}
        </button>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{flex:1,height:1,background:DS.border}}/><span style={{fontSize:11,color:DS.textDim}}>OU</span><div style={{flex:1,height:1,background:DS.border}}/>
        </div>
        <button onClick={async function(){var s=await AuthService.loginWithProvider(accType,"google");if(s)onAuth(accType,s.accountStatus,s.email,s.userId);}} style={{width:"100%",padding:"12px",background:DS.card,border:"1px solid "+DS.border,borderRadius:12,color:DS.text,fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
          <div style={{width:18,height:18,borderRadius:"50%",background:"#EA4335",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:10,color:"#fff",fontWeight:900}}>G</span></div>
          Continuer avec Google
        </button>
        <div style={{textAlign:"center",fontSize:13,color:DS.textMuted}}>
          {mode==="login"
            ? <span>Pas de compte ? <button onClick={function(){setMode("register");}} style={{background:"none",border:"none",color:DS.primary,fontSize:13,cursor:"pointer",fontWeight:700}}>S inscrire</button></span>
            : <button onClick={function(){setMode("login");}} style={{background:"none",border:"none",color:DS.primary,fontSize:13,cursor:"pointer",fontWeight:700}}>Deja un compte ? Se connecter</button>
          }
        </div>
        {mode==="login"&&<div style={{textAlign:"center",marginTop:8}}><button onClick={function(){setMode("forgot");}} style={{background:"none",border:"none",color:DS.textMuted,fontSize:12,cursor:"pointer"}}>Mot de passe oublie ?</button></div>}
      </div>
    </div>
  );
}
function AccountStatusScreen(props){
  var auth=props.auth;var onLogout=props.onLogout;
  var icon=null;var title="";var msg="";
  if(auth.accountStatus==="pending"){icon=<AlertTriangle size={48} color={DS.warning} style={{margin:"0 auto 16px",display:"block"}}/>;title="Validation en attente";msg="Votre compte est en cours de validation (48-72h).";}
  if(auth.accountStatus==="suspended"){icon=<Lock size={48} color={DS.error} style={{margin:"0 auto 16px",display:"block"}}/>;title="Compte suspendu";msg=auth.suspendReason||"Contactez le support.";}
  if(auth.accountStatus==="banned"){icon=<Shield size={48} color={DS.error} style={{margin:"0 auto 16px",display:"block"}}/>;title="Compte banni";msg=auth.banReason||"Banni definitivement.";}
  if(auth.accountStatus==="refused"){icon=<XCircle size={48} color={DS.error} style={{margin:"0 auto 16px",display:"block"}}/>;title="Demande refusee";msg="Votre demande a ete refusee.";}
  return(<div style={{minHeight:"100vh",background:DS.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}><div style={{width:"100%",maxWidth:360,textAlign:"center"}}>{icon}<div style={{fontSize:20,fontWeight:800,color:DS.text,marginBottom:8}}>{title}</div><div style={{fontSize:14,color:DS.textMuted,lineHeight:1.6,marginBottom:24}}>{msg}</div><a href="mailto:support@hotelplatform.com" style={{display:"block",padding:"12px",background:DS.primarySoft,border:"1px solid "+DS.primary+"33",borderRadius:12,color:DS.primary,fontSize:13,fontWeight:700,textDecoration:"none",textAlign:"center",marginBottom:12}}>Contacter le support</a><button onClick={onLogout} style={{padding:"12px",background:"transparent",border:"1px solid "+DS.border,borderRadius:12,color:DS.textMuted,fontSize:13,cursor:"pointer",width:"100%"}}>Se deconnecter</button></div></div>);
}

function NotifP(props){
  var accent=props.accent;var onBack=props.onBack;var onNavigate=props.onNavigate;
  var ns=useState([{id:1,Icon:Calendar,color:DS.primary,title:"Reservation confirmee",body:"Grand Hotel Royal a confirme votre reservation.",time:"10 min",read:false,tab:"discover"},{id:2,Icon:MessageCircle,color:DS.success,title:"Nouveau message",body:"Le Jardin Gourmand vous a envoye un message.",time:"1h",read:false,tab:"chat"},{id:3,Icon:Star,color:DS.gold,title:"Premium",body:"Votre abonnement Premium expire dans 7 jours.",time:"1j",read:true,tab:"profile"}]);
  var notifs=ns[0];var setNotifs=ns[1];
  return(<div style={{background:DS.bg,minHeight:"100vh"}}><TopBar left={<BackBtn onClick={onBack}/>} center={<div style={{fontSize:15,fontWeight:800,color:DS.text}}>Notifications</div>} right={null}/>{notifs.map(function(n){var Icon=n.Icon;return(<div key={n.id} onClick={function(){setNotifs(function(prev){return prev.map(function(x){return x.id===n.id?Object.assign({},x,{read:true}):x;});});if(onNavigate)onNavigate(n.tab);}} style={{display:"flex",gap:12,padding:"14px 16px",borderBottom:"1px solid "+DS.border+"20",cursor:"pointer",background:n.read?"transparent":n.color+"08"}}><div style={{width:40,height:40,borderRadius:"50%",background:n.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon size={18} color={n.color}/></div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:n.read?600:800,color:DS.text,marginBottom:2}}>{n.title}</div><div style={{fontSize:12,color:DS.textMuted}}>{n.body}</div><div style={{fontSize:10,color:DS.textDim,marginTop:4}}>{n.time}</div></div>{!n.read&&<div style={{width:8,height:8,borderRadius:"50%",background:accent,marginTop:6,flexShrink:0}}/>}</div>);})}</div>);
}

function SettingsS(props){
  var onBack=props.onBack;var accType=props.accType;var onLogout=props.onLogout;var onPremium=props.onPremium;var onPrivacy=props.onPrivacy;
  var color=rC(accType);
  return(<div style={{background:DS.bg,minHeight:"100vh"}}><TopBar left={<BackBtn onClick={onBack}/>} center={<div style={{fontSize:15,fontWeight:800,color:DS.text}}>Parametres</div>} right={null}/><div style={{padding:"8px 0 40px"}}><div style={{padding:"8px 16px",fontSize:10,fontWeight:800,color:DS.textDim,letterSpacing:1.5}}>ABONNEMENT</div><div style={{background:DS.card,borderRadius:12,margin:"0 12px 8px",border:"1px solid "+DS.border}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:"1px solid "+DS.border+"20"}}><div><div style={{fontSize:12,fontWeight:700,color:DS.gold}}>Passer Premium</div><div style={{fontSize:10,color:DS.textMuted}}>{accType==="client"?"Sans pub - Confidentialite - Badge eligible":"Video - Badge - Avis clients"}</div></div><button onClick={onPremium} style={{padding:"6px 14px",background:DS.gold,border:"none",borderRadius:20,color:"#000",fontSize:11,fontWeight:800,cursor:"pointer"}}>Voir</button></div></div><div style={{padding:"8px 16px",fontSize:10,fontWeight:800,color:DS.textDim,letterSpacing:1.5}}>COMPTE</div><div style={{background:DS.card,borderRadius:12,margin:"0 12px 8px",border:"1px solid "+DS.border}}>{[["Modifier mon profil",Edit2],["Changer d email",Mail],["Changer de mot de passe",Lock]].map(function(_i){var label=_i[0];var Ic=_i[1];return(<div key={label} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 16px",borderBottom:"1px solid "+DS.border+"20",cursor:"pointer"}}><div style={{width:32,height:32,borderRadius:9,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic size={15} color={color}/></div><span style={{flex:1,fontSize:13,color:DS.text}}>{label}</span><ChevronRight size={14} color={DS.textDim}/></div>);})}</div><div style={{padding:"8px 16px",fontSize:10,fontWeight:800,color:DS.textDim,letterSpacing:1.5}}>CONFIDENTIALITE</div><div style={{background:DS.card,borderRadius:12,margin:"0 12px 8px",border:"1px solid "+DS.border}}><div onClick={onPrivacy} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 16px",cursor:"pointer"}}><div style={{width:32,height:32,borderRadius:9,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center"}}><Eye size={15} color={color}/></div><span style={{flex:1,fontSize:13,color:DS.text}}>Parametres de confidentialite</span><ChevronRight size={14} color={DS.textDim}/></div></div><div style={{background:DS.card,borderRadius:12,margin:"0 12px 8px",border:"1px solid "+DS.border}}><div onClick={onLogout} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 16px",cursor:"pointer"}}><div style={{width:32,height:32,borderRadius:9,background:DS.error+"18",display:"flex",alignItems:"center",justifyContent:"center"}}><LogOut size={15} color={DS.error}/></div><span style={{flex:1,fontSize:13,color:DS.error}}>Se deconnecter</span></div></div></div></div>);
}

function PremiumModal(props){
  var onClose=props.onClose;var onSubscribe=props.onSubscribe;var accType=props.accType||"client";
  var s1=useState("std");var plan=s1[0];var setPlan=s1[1];
  var s2=useState(1);var step=s2[0];var setStep=s2[1];
  var s3=useState(1);var duration=s3[0];var setDuration=s3[1];
  var isClient=accType==="client";
  var PLANS=isClient
    ?[{id:"std",name:"Premium Essentiel",price:9.99,color:DS.client,features:["Sans publicite","Confidentialite avancee","Verrouillage de profil","Support prioritaire"]},
      {id:"plus",name:"Premium Plus",price:19.99,color:DS.gold,features:["Tout Essentiel","Badge eligible verification","Mode pseudonyme","Statistiques profil"]}]
    :[{id:"std",name:"Premium Standard",price:9.99,color:DS.primary,features:["Publications video","Sans publicite","Eligible badge verification","Eligible avis clients"]},
      {id:"plus",name:"Premium Plus",price:19.99,color:DS.gold,features:["Tout Standard","Mise en avant boostee","Visibilite prioritaire","Statistiques avancees"]},
      {id:"biz",name:"Premium Boostee Avancee",price:49.99,color:DS.hotel,features:["Tout Plus","Avantages exclusifs","Manager dedie","API access"]}];
  var sel=PLANS.find(function(p){return p.id===plan;})||PLANS[0];
  var DURATIONS=[{months:1,label:"1 mois",discount:0},{months:3,label:"3 mois",discount:0.10},{months:6,label:"6 mois",discount:0.20},{months:12,label:"12 mois",discount:0.30}];
  var selDur=DURATIONS.find(function(d){return d.months===duration;})||DURATIONS[0];
  var rawTotal=sel.price*selDur.months;
  var finalTotal=rawTotal*(1-selDur.discount);
  var savings=rawTotal-finalTotal;
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.9)",zIndex:1200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}><div style={{width:"100%",maxWidth:420,background:DS.surface,borderRadius:"22px 22px 0 0",border:"1px solid "+DS.border,maxHeight:"92vh",overflowY:"auto",animation:"hp-slide-up 0.32s ease"}}><div style={{padding:"16px 20px",borderBottom:"1px solid "+DS.border,display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{fontSize:16,fontWeight:900,color:DS.gold}}>HotelPlatform Premium</div><button onClick={onClose} style={{background:DS.card,border:"1px solid "+DS.border,borderRadius:"50%",width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={14} color={DS.textMuted}/></button></div><div style={{padding:"0 20px",display:"flex",gap:4,marginTop:14}}>{[1,2,3].map(function(s){return <div key={s} style={{flex:1,height:3,borderRadius:2,background:s<=step?DS.gold:DS.border}}/>;})}</div><div style={{padding:20}}>{step===1&&<div>{PLANS.map(function(p){var isS=plan===p.id;return(<button key={p.id} onClick={function(){setPlan(p.id);}} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",marginBottom:8,borderRadius:12,border:"1.5px solid "+(isS?p.color+"88":DS.border),background:isS?p.color+"14":DS.card,cursor:"pointer",textAlign:"left"}}><div><div style={{fontSize:13,fontWeight:800,color:isS?p.color:DS.text}}>{p.name}</div><div style={{fontSize:10,color:DS.textMuted,marginTop:2}}>{p.features.slice(0,2).join(" - ")}</div></div><div style={{fontSize:16,fontWeight:900,color:p.color}}>{p.price} EUR<span style={{fontSize:9,color:DS.textMuted,fontWeight:600}}>/mois</span></div></button>);})}  <button onClick={function(){setStep(2);}} style={{width:"100%",padding:"11px",background:DS.gold,border:"none",borderRadius:12,color:"#000",fontSize:14,fontWeight:900,cursor:"pointer",marginTop:8}}>Continuer</button></div>}{step===2&&<div><div style={{fontSize:14,fontWeight:800,color:DS.text,marginBottom:4}}>Choisissez votre duree</div><div style={{fontSize:12,color:DS.textMuted,marginBottom:14}}>{sel.name} - plus la duree est longue, plus la reduction est importante</div>{DURATIONS.map(function(d){var isS=duration===d.months;var dTotal=sel.price*d.months*(1-d.discount);return(<button key={d.months} onClick={function(){setDuration(d.months);}} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",marginBottom:8,borderRadius:12,border:"1.5px solid "+(isS?DS.gold+"88":DS.border),background:isS?DS.gold+"14":DS.card,cursor:"pointer",textAlign:"left"}}><div><div style={{fontSize:13,fontWeight:800,color:isS?DS.gold:DS.text}}>{d.label}</div>{d.discount>0&&<div style={{fontSize:10,color:DS.success,marginTop:2,fontWeight:700}}>Economisez {Math.round(d.discount*100)}%</div>}</div><div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:900,color:isS?DS.gold:DS.text}}>{dTotal.toFixed(2)} EUR</div><div style={{fontSize:9,color:DS.textMuted}}>{(dTotal/d.months).toFixed(2)} EUR/mois</div></div></button>);})}<div style={{display:"flex",gap:8,marginTop:8}}><button onClick={function(){setStep(1);}} style={{flex:1,padding:"11px",background:"transparent",border:"1px solid "+DS.border,borderRadius:12,color:DS.textMuted,fontSize:13,cursor:"pointer"}}>Retour</button><button onClick={function(){setStep(3);}} style={{flex:2,padding:"11px",background:DS.gold,border:"none",borderRadius:12,color:"#000",fontSize:14,fontWeight:900,cursor:"pointer"}}>Continuer</button></div></div>}{step===3&&<div style={{textAlign:"center",paddingBottom:10}}><div style={{width:72,height:72,borderRadius:"50%",background:DS.goldSoft,border:"2px solid "+DS.gold,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><VBadge sz={40}/></div><div style={{fontSize:18,fontWeight:900,color:DS.gold,marginBottom:6}}>{sel.name}</div><div style={{fontSize:13,color:DS.textMuted,marginBottom:16}}>{selDur.label} - {finalTotal.toFixed(2)} EUR{savings>0&&<span style={{color:DS.success}}> (economie de {savings.toFixed(2)} EUR)</span>}</div><div style={{background:DS.card,border:"1px solid "+DS.border,borderRadius:12,padding:"14px 16px",marginBottom:20,textAlign:"left"}}>{sel.features.map(function(f,i){return <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:i<sel.features.length-1?8:0}}><CheckCircle size={13} color={DS.gold}/><span style={{fontSize:12,color:DS.textMuted}}>{f}</span></div>;})}</div><div style={{display:"flex",gap:8}}><button onClick={function(){setStep(2);}} style={{flex:1,padding:"11px",background:"transparent",border:"1px solid "+DS.border,borderRadius:12,color:DS.textMuted,fontSize:13,cursor:"pointer"}}>Retour</button><button onClick={function(){if(onSubscribe)onSubscribe(plan,duration);}} style={{flex:2,padding:"11px",background:DS.gold,border:"none",borderRadius:12,color:"#000",fontSize:13,fontWeight:900,cursor:"pointer"}}>Confirmer l abonnement</button></div></div>}</div></div></div>);
}

function PrivacyModal(props){
  var onClose=props.onClose;var accType=props.accType;
  var color=rC(accType||"client");
  var isClientAcc=accType==="client";
  var settings=props.settings||{locked:false,pseudo:false,vis:"public",msgPermission:"everyone"};
  var onUpdate=props.onUpdate||function(){};
  var locked=settings.locked;var pseudo=settings.pseudo;var vis=settings.vis;var msgPermission=settings.msgPermission||"everyone";
  function setLocked(v){onUpdate({locked:v});}
  function setPseudo(v){onUpdate({pseudo:v});}
  function setVis(v){onUpdate({vis:v});}
  function setMsgPermission(v){onUpdate({msgPermission:v});}
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:1200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}><div style={{width:"100%",maxWidth:420,background:DS.surface,borderRadius:"22px 22px 0 0",border:"1px solid "+DS.border,maxHeight:"88vh",overflowY:"auto",animation:"hp-slide-up 0.28s ease"}}><div style={{padding:"16px 20px",borderBottom:"1px solid "+DS.border,display:"flex",alignItems:"center",justifyContent:"space-between"}}><div><div style={{fontSize:15,fontWeight:800,color:DS.text}}>Confidentialite Premium</div><div style={{fontSize:11,color:DS.textMuted}}>Controlez qui voit votre profil</div></div><button onClick={onClose} style={{background:DS.card,border:"1px solid "+DS.border,borderRadius:"50%",width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={14} color={DS.textMuted}/></button></div><div style={{padding:20}}>{isClientAcc&&[["Verrouiller mon profil","Photo floutee, galerie masquee",locked,setLocked],["Mode pseudonyme","Afficher un pseudonyme",pseudo,setPseudo]].map(function(_i,i){var title=_i[0];var desc=_i[1];var val=_i[2];var setter=_i[3];return(<div key={i} style={{background:DS.card,border:"1px solid "+DS.border,borderRadius:12,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:DS.text}}>{title}</div><div style={{fontSize:11,color:DS.textMuted}}>{desc}</div></div><div onClick={function(){setter(!val);}} style={{width:44,height:24,borderRadius:12,background:val?color:DS.border,cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}><div style={{position:"absolute",top:2,left:val?22:2,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/></div></div>);})} {isClientAcc&&<div style={{marginBottom:14}}><div style={{fontSize:13,fontWeight:700,color:DS.text,marginBottom:8}}>Visibilite du profil</div>{[["public","Tout le monde"],["friends","Amis uniquement"],["private","Profil prive"]].map(function(_i){var v=_i[0];var l=_i[1];var isAct=vis===v;return(<button key={v} onClick={function(){setVis(v);}} style={{width:"100%",padding:"9px 12px",marginBottom:5,borderRadius:10,border:"1px solid "+(isAct?color+"66":DS.border),background:isAct?color+"14":DS.card,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:8}}><div style={{width:16,height:16,borderRadius:"50%",border:"2px solid "+(isAct?color:DS.border),background:isAct?color:"transparent",flexShrink:0}}/><span style={{fontSize:12,color:isAct?color:DS.textMuted,fontWeight:isAct?700:400}}>{l}</span></button>);})} </div>}{!isClientAcc&&<div style={{background:DS.primarySoft,border:"1px solid "+DS.primary+"22",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:11,color:DS.textMuted}}>Votre profil etablissement est toujours public et visible par tous les utilisateurs de la plateforme.</div>}<div style={{marginBottom:14}}><div style={{fontSize:13,fontWeight:700,color:DS.text,marginBottom:2}}>Qui peut vous envoyer un message</div><div style={{fontSize:11,color:DS.textMuted,marginBottom:8}}>Controlez quels etablissements peuvent vous contacter</div>{[["everyone","Tout le monde"],["booked","Etablissements avec qui vous avez une reservation"],["none","Personne (messages bloques)"]].map(function(_i){var v=_i[0];var l=_i[1];var isAct=msgPermission===v;return(<button key={v} onClick={function(){setMsgPermission(v);}} style={{width:"100%",padding:"9px 12px",marginBottom:5,borderRadius:10,border:"1px solid "+(isAct?color+"66":DS.border),background:isAct?color+"14":DS.card,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:8}}><div style={{width:16,height:16,borderRadius:"50%",border:"2px solid "+(isAct?color:DS.border),background:isAct?color:"transparent",flexShrink:0}}/><span style={{fontSize:12,color:isAct?color:DS.textMuted,fontWeight:isAct?700:400}}>{l}</span></button>);})} </div><button onClick={onClose} style={{width:"100%",padding:"11px",background:color,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer"}}>Enregistrer</button></div></div></div>);
}

function ChatUI(props){
  var init=props.chats;var myColor=props.myColor;var nK=props.nK;var iK=props.iK;var vK=props.vK;var qR=props.qR;
  var s1=useState(null);var active=s1[0];var setActive=s1[1];
  var s2=useState("");var msg=s2[0];var setMsg=s2[1];
  var s3=useState(null);var replyTo=s3[0];var setReplyTo=s3[1];
  var smnu=useState(null);var menuMsg=smnu[0];var setMenuMsg=smnu[1];
  var mlpTimer=useRef(null);
  function mlpStart(m,e){if(m.f!=="me"||m.deleted)return;mlpTimer.current=setTimeout(function(){if(e&&e.cancelable)e.preventDefault();setMenuMsg(m);},480);}
  function mlpCancel(){if(mlpTimer.current){clearTimeout(mlpTimer.current);mlpTimer.current=null;}}
  var s4=useState(init.map(function(c){return Object.assign({},c,{msgs:(c.messages||[]).slice()});}));
  var thr=s4[0];var setThr=s4[1];
  function send(){if(!msg.trim())return;var nm=MessageService.buildMessage(msg,replyTo);setThr(function(ts){return ts.map(function(c,i){return i===active?Object.assign({},c,{msgs:c.msgs.concat([nm])}):c;});});setMsg("");setReplyTo(null);}
  function delMsg(id){setThr(function(ts){return ts.map(function(c,i){return i===active?Object.assign({},c,{msgs:c.msgs.map(function(m){return MessageService.markDeleted(m,id);})}):c;});});}
  function markRead(idx){setThr(function(ts){return ts.map(function(c,i){return i===idx?Object.assign({},c,{msgs:c.msgs.map(function(m){return MessageService.markRead(m);})}):c;});});}
  var conv=active!==null?thr[active]:null;
  if(active===null){return(<div style={{background:DS.bg,minHeight:"100%"}}><div style={{padding:"14px 16px",borderBottom:"1px solid "+DS.border,display:"flex",alignItems:"center",gap:10}}><MessageCircle size={18} color={myColor}/><div style={{fontSize:15,fontWeight:800,color:DS.text}}>Messages</div><div style={{marginLeft:"auto",fontSize:11,color:DS.textMuted}}>{thr.length} conversation{thr.length>1?"s":""}</div></div>{thr.length===0?<Emp Icon={MessageCircle} title="Aucun message" sub="Vos conversations apparaissent ici"/>:thr.map(function(t,i){var last=t.msgs[t.msgs.length-1];var unread=t.msgs.filter(function(m){return m.f!=="me"&&!m.read;}).length;return(<div key={i} onClick={function(){setActive(i);markRead(i);}} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:"1px solid "+DS.border+"20",cursor:"pointer"}}><Av sz={46} letter={(t[nK]||"?")[0]} img={iK?t[iK]:null} verified={t[vK]||false}/><div style={{flex:1,minWidth:0}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><div style={{fontSize:13,fontWeight:700,color:DS.text}}>{t[nK]}</div><div style={{fontSize:10,color:DS.textMuted}}>{last?last.time:""}</div></div><div style={{fontSize:12,color:unread>0?DS.text:DS.textMuted,fontWeight:unread>0?600:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{last?last.t:"..."}</div></div>{unread>0&&<div style={{width:18,height:18,borderRadius:"50%",background:myColor,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",fontWeight:700,flexShrink:0}}>{unread}</div>}</div>);})}</div>);}
  var msgs=conv?conv.msgs:[];
  return(<div style={{display:"flex",flexDirection:"column",height:"100%",background:DS.bg}}><div style={{padding:"12px 16px",borderBottom:"1px solid "+DS.border,display:"flex",alignItems:"center",gap:10,background:DS.surface,flexShrink:0}}><BackBtn onClick={function(){setActive(null);setReplyTo(null);}}/><Av sz={38} letter={(conv[nK]||"?")[0]} img={iK?conv[iK]:null} verified={conv[vK]||false}/><div style={{flex:1}}><div style={{fontSize:14,fontWeight:800,color:DS.text}}>{conv[nK]}</div><div style={{fontSize:10,color:DS.success}}>En ligne</div></div></div><div style={{flex:1,overflowY:"auto",padding:"12px 16px",display:"flex",flexDirection:"column",gap:6}}>{msgs.length===0&&<div style={{textAlign:"center",color:DS.textMuted,fontSize:12,marginTop:40}}>Debut de la conversation</div>}{msgs.map(function(m,i){var isMe=m.f==="me";return(<div key={m.id||i} style={{display:"flex",flexDirection:"column",alignItems:isMe?"flex-end":"flex-start"}}>{m.replyTo&&!m.deleted&&<div style={{padding:"4px 10px",background:DS.border,borderRadius:"8px 8px 0 0",fontSize:10,color:DS.textMuted,maxWidth:"75%",borderLeft:"3px solid "+myColor,marginBottom:-2}}><div style={{fontWeight:700,color:myColor}}>{m.replyTo.f==="me"?"Vous":conv[nK]}</div><div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.replyTo.t}</div></div>}<div onDoubleClick={function(){if(!m.deleted)setReplyTo(m);}} onTouchStart={function(e){mlpStart(m,e);}} onTouchEnd={mlpCancel} onTouchMove={mlpCancel} onMouseDown={function(){mlpStart(m);}} onMouseUp={mlpCancel} onMouseLeave={mlpCancel} onContextMenu={function(e){e.preventDefault();if(isMe&&!m.deleted)setMenuMsg(m);}} style={{padding:"9px 13px",borderRadius:isMe?"18px 18px 4px 18px":"18px 18px 18px 4px",background:m.deleted?DS.border:isMe?myColor:DS.card,color:m.deleted?DS.textDim:isMe?"#fff":DS.text,fontSize:13,maxWidth:"75%",lineHeight:1.45,cursor:"pointer",fontStyle:m.deleted?"italic":"normal",userSelect:"none",WebkitUserSelect:"none",MozUserSelect:"none",msUserSelect:"none",WebkitTouchCallout:"none"}}>{m.deleted?"[Message supprime]":m.t}</div><div style={{display:"flex",alignItems:"center",gap:4,marginTop:2}}><span style={{fontSize:9,color:DS.textDim}}>{m.time}</span>{isMe&&!m.deleted&&<span style={{fontSize:9,color:m.read?myColor:DS.textDim}}>{m.read?"Lu":"Envoye"}</span>}</div></div>);})} </div>{replyTo&&<div style={{padding:"6px 16px",background:DS.surface,borderTop:"1px solid "+DS.border,display:"flex",alignItems:"center",gap:8,flexShrink:0}}><div style={{flex:1,borderLeft:"3px solid "+myColor,paddingLeft:8}}><div style={{fontSize:10,color:myColor,fontWeight:700}}>Repondre</div><div style={{fontSize:11,color:DS.textMuted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{replyTo.t}</div></div><button onClick={function(){setReplyTo(null);}} style={{background:"none",border:"none",cursor:"pointer"}}><X size={14} color={DS.textMuted}/></button></div>}{qR&&msgs.length===0&&<div style={{padding:"6px 16px",display:"flex",gap:6,flexWrap:"wrap",flexShrink:0}}>{qR.map(function(q,i){return <button key={i} onClick={function(){setMsg(q);}} style={{padding:"5px 12px",borderRadius:20,border:"1px solid "+myColor+"44",background:myColor+"12",color:myColor,fontSize:11,cursor:"pointer"}}>{q}</button>;})} </div>}<div style={{padding:"10px 14px",borderTop:"1px solid "+DS.border,display:"flex",gap:8,alignItems:"center",background:DS.surface,flexShrink:0}}><input value={msg} onChange={function(e){setMsg(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter"&&!e.shiftKey)send();}} placeholder={replyTo?"Repondre...":"Message..."} style={{flex:1,background:DS.card,border:"1px solid "+DS.border,borderRadius:22,padding:"10px 16px",fontSize:13,color:DS.text,outline:"none"}}/><button onClick={send} disabled={!msg.trim()} style={{width:40,height:40,borderRadius:"50%",background:msg.trim()?myColor:DS.border,border:"none",cursor:msg.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Send size={16} color="#fff"/></button></div>{menuMsg&&<ActionSheet label="ce message" onClose={function(){setMenuMsg(null);}} onDelete={function(){delMsg(menuMsg.id);}}/>}</div>);
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
        <div style={{fontSize:11,color:copied?DS.success:DS.textMuted,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:copied?700:400}}>{copied?"Lien copie dans le presse-papier !":shareUrl}</div>
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
  var menuC=useState(null);var menuCm=menuC[0];var setMenuCm=menuC[1];
  var selfName=props.selfName||"Vous";
  var lpTimer=useRef(null);
  function lpStart(cm,e){if(cm.author!==selfName)return;lpTimer.current=setTimeout(function(){if(e&&e.cancelable)e.preventDefault();setMenuCm(cm);},480);}
  function lpCancel(){if(lpTimer.current){clearTimeout(lpTimer.current);lpTimer.current=null;}}
  var sd=useState(0);var dragY=sd[0];var setDragY=sd[1];
  var dragging=useState(false);var isDragging=dragging[0];var setIsDragging=dragging[1];
  var st=useRef(null);var cur=useRef(0);var scrollerRef=useRef(null);var fromScroller=useRef(false);
  function beginDrag(y,viaScroller){st.current=y;cur.current=0;fromScroller.current=!!viaScroller;setIsDragging(true);}
  function moveDrag(y){if(st.current===null)return;var dy=y-st.current;cur.current=dy>0?dy:0;setDragY(cur.current);}
  function endDrag(){if(cur.current>90){onClose();return;}st.current=null;cur.current=0;fromScroller.current=false;setDragY(0);setIsDragging(false);}
  // Drag depuis la poignee / en-tete (toujours actif)
  function onHeadTouchStart(e){beginDrag(e.touches[0].clientY,false);}
  function onHeadTouchMove(e){if(st.current!==null){e.preventDefault();moveDrag(e.touches[0].clientY);}}
  function onHeadTouchEnd(){endDrag();}
  function onHeadMouseDown(e){beginDrag(e.clientY,false);}
  // Drag depuis la liste : seulement si on est tout en haut et qu'on tire vers le bas
  var listStartY=useRef(null);
  function onListTouchStart(e){listStartY.current=e.touches[0].clientY;}
  function onListTouchMove(e){
    var sc=scrollerRef.current;if(!sc)return;
    var y=e.touches[0].clientY;
    if(st.current!==null){e.preventDefault();moveDrag(y);return;}
    if(listStartY.current===null)return;
    var dy=y-listStartY.current;
    if(sc.scrollTop<=0&&dy>6){e.preventDefault();beginDrag(listStartY.current,true);moveDrag(y);}
  }
  function onListTouchEnd(){listStartY.current=null;if(st.current!==null)endDrag();}
  useEffect(function(){
    if(!isDragging)return;
    function mm(e){moveDrag(e.clientY);}
    function mu(){endDrag();}
    window.addEventListener("mousemove",mm);
    window.addEventListener("mouseup",mu);
    return function(){window.removeEventListener("mousemove",mm);window.removeEventListener("mouseup",mu);};
  },[isDragging]);
  return(<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1300,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
    <div onClick={function(e){e.stopPropagation();}} style={{width:"100%",maxWidth:480,height:"90vh",background:DS.surface,borderRadius:"20px 20px 0 0",border:"1px solid "+DS.border,display:"flex",flexDirection:"column",overflow:"hidden",animation:isDragging?"none":"hp-slide-up 0.3s ease",transform:dragY>0?"translateY("+dragY+"px)":"none",transition:isDragging?"none":"transform 0.28s cubic-bezier(0.22,1,0.36,1)"}}>
      <div onTouchStart={onHeadTouchStart} onTouchMove={onHeadTouchMove} onTouchEnd={onHeadTouchEnd} onMouseDown={onHeadMouseDown} style={{flexShrink:0,cursor:"grab",userSelect:"none",touchAction:"none"}}>
        <div style={{padding:"10px 0 8px"}}>
          <div style={{width:44,height:5,borderRadius:3,background:DS.textDim,margin:"0 auto"}}/>
          <div style={{textAlign:"center",fontSize:10,color:DS.textDim,marginTop:5}}>Glisser vers le bas pour fermer</div>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"4px 16px 12px",borderBottom:"1px solid "+DS.border+"40"}}>
          <span style={{fontSize:16,fontWeight:800,color:DS.text}}>Commentaires{post.comments.length>0?" ("+post.comments.length+")":""}</span>
        </div>
      </div>
      <div ref={scrollerRef} onTouchStart={onListTouchStart} onTouchMove={onListTouchMove} onTouchEnd={onListTouchEnd} style={{flex:1,minHeight:0,overflowY:"auto",overflowX:"hidden",padding:"14px 16px",overscrollBehavior:"none"}}>
        {post.comments.length===0&&<div style={{textAlign:"center",color:DS.textDim,fontSize:13,padding:"30px 0"}}>Aucun commentaire pour le moment. Soyez le premier !</div>}
        {post.comments.map(function(cm,i){var mine=cm.author===selfName;return(
          <div key={i} style={{display:"flex",gap:8,marginBottom:12}}>
            <Av sz={30} letter={cm.author[0]}/>
            <div style={{flex:1}}>
              <div onTouchStart={function(e){lpStart(cm,e);}} onTouchEnd={lpCancel} onTouchMove={lpCancel} onMouseDown={function(){lpStart(cm);}} onMouseUp={lpCancel} onMouseLeave={lpCancel} onContextMenu={function(e){e.preventDefault();if(mine)setMenuCm(cm);}} style={{background:DS.card,borderRadius:"0 12px 12px 12px",padding:"8px 12px",cursor:mine?"pointer":"default",userSelect:"none",WebkitUserSelect:"none",MozUserSelect:"none",msUserSelect:"none",WebkitTouchCallout:"none"}}>
                <div style={{fontSize:12,fontWeight:700,color:DS.text,marginBottom:2}}>{cm.author}</div>
                <div style={{fontSize:13,color:DS.textMuted,lineHeight:1.45}}>{cm.text}</div>
              </div>
              <div style={{fontSize:9,color:DS.textDim,marginTop:3,paddingLeft:6}}>{cm.time}{mine?" - maintenir pour supprimer":""}</div>
            </div>
          </div>
        );})}
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center",padding:"10px 16px",borderTop:"1px solid "+DS.border+"40",flexShrink:0,background:DS.surface}}>
        <Av sz={30} letter={selfLetter}/>
        <div style={{flex:1,position:"relative"}}>
          <input value={cmtText[post.id]||""} onChange={function(e){var nc=Object.assign({},cmtText);nc[post.id]=e.target.value;setCmtText(nc);}} onKeyDown={function(e){if(e.key==="Enter")addCmt(post.id);}} placeholder="Ajouter un commentaire..." style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:24,padding:"11px 50px 11px 16px",fontSize:14,color:DS.text,outline:"none",boxSizing:"border-box"}}/>
          <button onClick={function(){addCmt(post.id);}} style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",background:DS.primary,border:"none",borderRadius:"50%",width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><Send size={14} color="#fff"/></button>
        </div>
      </div>
    </div>
    {menuCm&&<ActionSheet label="ce commentaire" onClose={function(){setMenuCm(null);}} onDelete={function(){if(delCmt)delCmt(post.id,menuCm.id);}}/>}
  </div>);
}

function ClientFeed(props){
  var onProfile=props.onProfile;
  var selfEmail=props.selfEmail||"";
  var selfName=selfEmail?selfEmail.split("@")[0]:"Vous";
  var selfLetter=(selfName[0]||"V").toUpperCase();
  var _init=useRef(null);
  if(!_init.current){var _lk={};var _fv=[];try{_lk=JSON.parse(localStorage.getItem("hp_likes")||"{}");_fv=JSON.parse(localStorage.getItem("hp_favs")||"[]");}catch(e){}_init.current={likes:_lk,favs:_fv};}
  var _initLikes=_init.current.likes;var _initFavs=_init.current.favs;
  var s1=useState(DataLayer.getFeed().map(function(p){return Object.assign({},p,{liked:!!_initLikes[p.id],likes:p.likes+(_initLikes[p.id]?1:0),comments:[],showCmt:false});}));
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
    toast(wasFav?"Retire des favoris":"Ajoute aux favoris","success");
  }
  function openReport(post){setMenuOpen(null);setReportTarget(post);}
  function toggleFollowPost(id){if(props.onToggleFollow)props.onToggleFollow(id);}
  function toggleLike(id){
    setPosts(function(ps){
      var next=ps.map(function(p){return p.id===id?Object.assign({},p,{liked:!p.liked,likes:p.liked?p.likes-1:p.likes+1}):p;});
      try{var lk={};next.forEach(function(p){if(p.liked)lk[p.id]=1;});localStorage.setItem("hp_likes",JSON.stringify(lk));}catch(e){}
      return next;
    });
  }
  function toggleCmt(id){setPosts(function(ps){return ps.map(function(p){return p.id===id?Object.assign({},p,{showCmt:!p.showCmt}):p;});});}
  function doShare(id){var p=null;for(var k=0;k<posts.length;k++){if(posts[k].id===id){p=posts[k];break;}}setSharePost(p);}
  function confirmShare(id){setPosts(function(ps){return ps.map(function(p){return p.id===id?Object.assign({},p,{shares:(p.shares||0)+1}):p;});});toast("Partage avec succes","success");}
  function addCmt(id){
    var text=(cmtText[id]||"").trim();if(!text)return;
    var cm={id:Date.now(),author:selfName,text:text,time:"maintenant"};
    setPosts(function(ps){return ps.map(function(p){return p.id===id?Object.assign({},p,{comments:p.comments.concat([cm])}):p;});});
    var nc=Object.assign({},cmtText);nc[id]="";setCmtText(nc);
    toast("Commentaire publie","success");
  }
  function delCmt(postId,cmId){
    setPosts(function(ps){return ps.map(function(p){return p.id===postId?Object.assign({},p,{comments:p.comments.filter(function(cm){return cm.id!==cmId;})}):p;});});
    toast("Commentaire supprime","success");
  }
  return(
    <div style={{background:DS.bg,paddingBottom:24}}>
      <Toast/>
      {reportTarget&&<ReportM targetName={"la publication de "+reportTarget.author} onClose={function(){setReportTarget(null);}} onSubmit={function(){toast("Signalement envoye - Merci","success");}}/>}
      {menuOpen&&<div onClick={function(){setMenuOpen(null);}} style={{position:"fixed",inset:0,zIndex:199}}/>}
      {posts.map(function(post){
        var color=rC(post.type);
        return(
          <div key={post.id} style={{background:DS.surface,marginBottom:10,borderTop:"1px solid "+DS.border+"28",borderBottom:"1px solid "+DS.border+"28"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12,padding:"18px 16px 14px"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12,flex:1,minWidth:0}}>
                <div onClick={function(){if(onProfile)onProfile(post.id,post.type);}} style={{cursor:"pointer",flexShrink:0}}>
                  <Av sz={52} letter={post.author[0]} verified={post.verified}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div onClick={function(){if(onProfile)onProfile(post.id,post.type);}} style={{fontSize:15,fontWeight:800,color:DS.text,lineHeight:1.3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",cursor:"pointer",display:"inline-block",maxWidth:"100%"}}>{post.author}</div>
                  <div style={{display:"flex",flexWrap:"nowrap",alignItems:"center",gap:5,marginTop:2,overflow:"hidden"}}>
                    <span style={{fontSize:12,color:color,fontWeight:700,flexShrink:0,whiteSpace:"nowrap"}}>{post.type==="hotel"?"Hotel":"Restaurant"}</span>
                    {post.combined&&<span style={{fontSize:9,color:DS.primary,fontWeight:800,background:DS.primarySoft,borderRadius:8,padding:"1px 6px",flexShrink:0,whiteSpace:"nowrap"}}>+ Restaurant</span>}
                    <span style={{fontSize:12,color:DS.textMuted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0}}>{post.followers?"- "+fmtK(post.followers)+" abonnes":""}</span>
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
            <div style={{padding:"0 16px 16px",fontSize:15,color:DS.text,lineHeight:1.7}}>{post.text}</div>
            {post.img&&<img src={post.img} alt="" onError={function(e){e.target.style.display="none";}} style={{width:"100%",minHeight:380,maxHeight:620,objectFit:"cover",display:"block"}}/>}
            <div style={{display:"flex",justifyContent:"space-between",padding:"12px 16px 2px",fontSize:12,color:DS.textDim}}>
              <span>{post.likes} reaction{post.likes!==1?"s":""}</span>
              <span style={{cursor:"pointer"}} onClick={function(){toggleCmt(post.id);}}>{post.comments.length} commentaire{post.comments.length!==1?"s":""}</span><span>{post.shares||0} partage{(post.shares||0)!==1?"s":""}</span>
            </div>
            <div style={{display:"flex",borderTop:"1px solid "+DS.border+"30",marginTop:8}}>
              {[["Liker",Heart,post.liked?DS.error:DS.textMuted,function(){toggleLike(post.id);}],["Commenter",MessageCircle,DS.textMuted,function(){toggleCmt(post.id);}],["Partager",Share2,DS.textMuted,function(){doShare(post.id);}]].map(function(_i){
                var lb=_i[0];var Icon=_i[1];var col=_i[2];var fn=_i[3];
                return(
                  <button key={lb} onClick={fn} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"13px 0",background:"none",border:"none",cursor:"pointer",color:col,fontSize:13,fontWeight:lb==="Liker"&&post.liked?700:500}}>
                    <Icon size={20} fill={lb==="Liker"&&post.liked?DS.error:"none"} color={col}/>{lb}
                  </button>
                );
              })}
            </div>
            {post.showCmt&&(
              <CommentsSheet post={post} cmtText={cmtText} setCmtText={setCmtText} addCmt={addCmt} delCmt={delCmt} selfName={selfName} selfLetter={selfLetter} onClose={function(){toggleCmt(post.id);}}/>
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
  var items=tab==="hotels"?DataLayer.getHotels():DataLayer.getRestaurants();
  var filtered=items.filter(function(i){return i.name.toLowerCase().indexOf(search.toLowerCase())>=0||i.location.toLowerCase().indexOf(search.toLowerCase())>=0;});
  var color=tab==="hotels"?DS.hotel:DS.restaurant;
  return(<div style={{background:DS.bg}}><div style={{padding:"10px 14px",background:DS.surface,borderBottom:"1px solid "+DS.border}}><div style={{display:"flex",alignItems:"center",gap:8,background:DS.card,borderRadius:12,padding:"9px 14px",border:"1px solid "+DS.border}}><Search size={14} color={DS.textMuted}/><input value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="Rechercher..." style={{flex:1,background:"none",border:"none",outline:"none",color:DS.text,fontSize:13}}/></div></div><div style={{display:"flex",padding:"10px 14px",gap:8}}>{[["hotels","Hotels",Building2,DS.hotel],["restaurants","Restaurants",Utensils,DS.restaurant]].map(function(_i){var t=_i[0];var l=_i[1];var Ic=_i[2];var col=_i[3];var isAct=tab===t;return <button key={t} onClick={function(){setTab(t);}} style={{flex:1,padding:"8px",borderRadius:12,border:"1px solid "+(isAct?col:DS.border),background:isAct?col+"18":"transparent",color:isAct?col:DS.textMuted,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Ic size={14}/>{l}</button>;})} </div><div style={{padding:"0 14px",paddingBottom:16}}>{filtered.length===0?<Emp Icon={Search} title="Aucun resultat"/>:filtered.map(function(item){return(<div key={item.id} style={{marginBottom:12,background:DS.card,borderRadius:16,overflow:"hidden",border:"1px solid "+DS.border}}><div onClick={function(){if(onProfile)onProfile(item.id,item.type);}} style={{cursor:"pointer"}}><div style={{position:"relative",height:160}}><img src={item.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>{item.verified&&<div style={{position:"absolute",top:8,left:8}}><VBadge sz={20}/></div>}{item.svcMode==="combined"&&<div style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,.65)",borderRadius:20,padding:"4px 10px",display:"flex",alignItems:"center",gap:4}}><Utensils size={10} color="#fff"/><span style={{fontSize:9,color:"#fff",fontWeight:800}}>Hotel + Restaurant</span></div>}</div><div style={{padding:"12px 14px 0"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}><div><div style={{fontSize:15,fontWeight:800,color:DS.text}}>{item.name}</div><div style={{fontSize:11,color:DS.textMuted}}>{item.location}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:900,color:DS.gold}}>{item.priceFrom} EUR</div><div style={{fontSize:9,color:DS.textMuted}}>a partir de</div></div></div><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}><Stars r={item.rating} sz={12}/><span style={{fontSize:11,color:DS.textMuted}}>({item.reviewCount} avis)</span></div></div></div><div style={{padding:"8px 14px 14px",display:"flex",gap:8}}><button onClick={function(){if(onProfile)onProfile(item.id,item.type);}} style={{flex:1,padding:"8px",background:DS.surface,border:"1px solid "+DS.border,borderRadius:10,color:DS.textMuted,fontSize:12,cursor:"pointer"}}>Voir profil</button><button onClick={function(){if(item.svcMode==="combined"){if(onProfile)onProfile(item.id,item.type);}else{if(onBook)onBook(item);}}} style={{flex:1,padding:"8px",background:color,border:"none",borderRadius:10,color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer"}}><Calendar size={12} style={{display:"inline",marginRight:4}}/>{item.svcMode==="combined"?"Voir options":"Reserver"}</button></div></div>);})}</div></div>);
}

function ClientProf(props){
  var onSettings=props.onSettings;var onPremium=props.onPremium;var isPremium=props.isPremium||false;var onPrivacy=props.onPrivacy;var resaHistory=props.resaHistory||[];var premiumData=props.premiumData||null;var onRenewPremium=props.onRenewPremium;var followingCount=props.followingCount||0;
  var selfEmail=props.selfEmail||"";var displayName=selfEmail?selfEmail.split("@")[0]:"Mon profil";var displayLetter=(displayName[0]||"M").toUpperCase();
  var _allEstabs=DataLayer.getHotels().concat(DataLayer.getRestaurants());
  var favEstabIds=props.favEstabIds||[];
  var favEstabs=favEstabIds.map(function(id){return _allEstabs.find(function(x){return x.id===id;});}).filter(Boolean);
  var s1=useState("reservations");var tab=s1[0];var setTab=s1[1];
  var sq=useState(null);var activeQR=sq[0];var setActiveQR=sq[1];

  return(<div style={{paddingBottom:20}}><LoyaltyWidget points={620} level="silver"/><div style={{background:"linear-gradient(180deg,"+DS.clientSoft+",transparent)",padding:"16px 16px 12px",textAlign:"center"}}><Av sz={72} letter={displayLetter}/><div style={{fontSize:18,fontWeight:800,color:DS.text,marginTop:10}}>{displayName}</div><div style={{fontSize:12,color:DS.textMuted,marginTop:2}}>{selfEmail||""}</div><div style={{display:"flex",gap:8,marginTop:12,justifyContent:"center"}}>{!isPremium&&<button onClick={function(){if(onPremium)onPremium();}} style={{padding:"6px 14px",background:DS.goldSoft,border:"1px solid "+DS.gold+"33",borderRadius:20,color:DS.gold,fontSize:11,fontWeight:800,cursor:"pointer"}}>Premium & avantages</button>}{isPremium&&premiumData&&<button onClick={function(){if(onRenewPremium)onRenewPremium();}} style={{padding:"6px 14px",background:DS.goldSoft,border:"1px solid "+DS.gold+"33",borderRadius:20,color:DS.gold,fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}><VBadge sz={11}/>Actif jusqu au {new Date(premiumData.expiresAt).toLocaleDateString("fr-FR")}</button>}<button onClick={function(){if(onSettings)onSettings();}} style={{padding:"7px 10px",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center"}}><Settings size={14} color={DS.textMuted}/></button>{onPrivacy&&<button onClick={function(){if(onPrivacy)onPrivacy();}} style={{padding:"7px 10px",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center"}}><Eye size={13} color={DS.textMuted}/></button>}</div></div><div style={{display:"flex",margin:"0 16px 12px",background:DS.card,borderRadius:12,border:"1px solid "+DS.border,overflow:"hidden"}}>{[[String(followingCount),"Suivis",null],[String(favEstabs.length),"Favoris","favoris"],[String(resaHistory.length),"Resas","reservations"]].map(function(_i,i){var n=_i[0];var l=_i[1];var tgt=_i[2];return <div key={l} onClick={function(){if(tgt)setTab(tgt);}} style={{flex:1,padding:"9px 0",textAlign:"center",borderRight:i<2?"1px solid "+DS.border:"none",cursor:tgt?"pointer":"default"}}><div style={{fontSize:18,fontWeight:800,color:tgt&&tab===tgt?DS.client:DS.text}}>{n}</div><div style={{fontSize:10,color:tgt&&tab===tgt?DS.client:DS.textMuted}}>{l}</div></div>;})}</div><div style={{display:"flex",gap:4,padding:"0 16px",marginBottom:12}}>{[["reservations","Reservations"],["favoris","Favoris"]].map(function(_i){var t=_i[0];var l=_i[1];var isAct=tab===t;return <button key={t} onClick={function(){setTab(t);}} style={{flex:1,padding:"7px",borderRadius:10,border:"1px solid "+(isAct?DS.client:DS.border),background:isAct?DS.clientSoft:"transparent",color:isAct?DS.client:DS.textMuted,fontSize:11,fontWeight:700,cursor:"pointer"}}>{l}</button>;})} </div><div style={{padding:"0 16px"}}>{tab==="reservations"&&(
          (resaHistory&&resaHistory.length>0)?resaHistory.map(function(r,i){
            var showQR=activeQR===i;
            var st=r.status||"pending";
            var stLabel={pending:"En attente",refused:"Refusee",confirmed:"Acceptee",consumed:"Consommee"}[st]||"En attente";
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
                      <div style={{fontSize:16,fontWeight:900,color:r.payMode==="avec"?DS.gold:DS.success}}>{r.payMode==="avec"?r.total.toFixed(0)+" EUR":"Sans paiement"}</div>
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
                  {st==="pending"&&<div style={{fontSize:11,color:DS.warning,textAlign:"center",padding:"6px 0"}}>En attente de confirmation de l etablissement</div>}
                  {st==="refused"&&<div style={{fontSize:11,color:DS.error,textAlign:"center",padding:"6px 0"}}>Cette reservation a ete refusee</div>}
                </div>
                {showQR&&hasTicket&&(
                  <div style={{borderTop:"1px solid "+DS.border,background:DS.surface,padding:"16px",textAlign:"center"}}>
                    <div style={{fontSize:11,fontWeight:800,color:DS.textDim,letterSpacing:1.5,marginBottom:12}}>TICKET DE RESERVATION - QR CODE</div>
                    <div style={{textAlign:"left",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"10px 12px",marginBottom:12}}>
                      {(r.estabType==="restaurant"?[
                        ["Convives",r.guests+" pers."],
                        ["Tables",(r.tableCount||1)+" table"+((r.tableCount||1)>1?"s":"")],
                        ["Date",r.dateIn],
                      ]:[
                        ["Voyageurs",r.guests+" pers."],
                        ["Nuits",r.nights+" nuit"+(r.nights>1?"s":"")],
                        ["Arrivee",r.dateIn],
                        ["Depart",r.dateOut],
                      ]).concat([["Paiement",r.payMode==="avec"?(r.total.toFixed(0)+" EUR - "+(r.payMethod==="card"?"Carte bancaire":"Mobile Money")):"Sans paiement (a l arrivee)"]]).map(function(_i){var k=_i[0];var v=_i[1];return(
                        <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:11}}>
                          <span style={{color:DS.textMuted}}>{k}</span>
                          <span style={{color:DS.text,fontWeight:700}}>{v}</span>
                        </div>
                      );})}
                    </div>
                    {st==="pending"&&<div style={{background:DS.warningSoft,border:"1px solid "+DS.warning+"33",borderRadius:8,padding:"6px 10px",marginBottom:10,fontSize:10,color:DS.warning,fontWeight:700}}>En attente de confirmation - presentez ce code a l etablissement</div>}
                    <div style={{display:"inline-flex",padding:12,background:"#fff",borderRadius:12,marginBottom:12,opacity:st==="consumed"?0.4:1}}>
                      <div style={{width:110,height:110,display:"grid",gridTemplateColumns:"repeat(10,1fr)",gap:1}}>
                        {[1,1,1,1,0,1,0,1,1,1,1,0,0,1,0,0,1,0,0,1,1,0,1,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,0,1,1,1,1,1,0,1,0,1,1,1,0,0,0,0,1,0,1,0,0,0,1,1,0,1,0,1,0,1,1,0,0,0,1,0,0,0,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0,1,1,1,0,1,0,1,1,1].map(function(px,pi){return <div key={pi} style={{background:px?"#000":"#fff"}}/>;  })}
                      </div>
                    </div>
                    <div style={{fontSize:10,color:DS.textDim,fontFamily:"monospace",letterSpacing:1,marginBottom:4}}>{r.id||"HP-000000"}</div>
                    {st==="consumed"
                      ? <div style={{fontSize:10,color:DS.textDim,fontWeight:600}}>Reservation consommee - presentee a l etablissement</div>
                      : st==="pending"
                      ? <div style={{fontSize:10,color:DS.warning,fontWeight:600}}>Ce code sera scannable une fois la reservation acceptee</div>
                      : <div style={{fontSize:10,color:DS.warning,fontWeight:600}}>Presentez ce code a l etablissement le jour de votre arrivee</div>
                    }
                  </div>
                )}
              </div>
            );
          })
          : <Emp Icon={Calendar} title="Aucune reservation" sub="Vos reservations apparaitront ici apres votre premiere reservation"/>
        )}
        {tab==="favoris"&&(favEstabs.length>0?favEstabs.map(function(est){return(<div key={est.id} style={{background:DS.card,borderRadius:14,marginBottom:10,border:"1px solid "+DS.border,overflow:"hidden"}}><div style={{height:80,position:"relative"}}><img src={est.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>{est.verified&&<div style={{position:"absolute",top:6,left:8}}><VBadge sz={16}/></div>}</div><div style={{padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:13,fontWeight:800,color:DS.text}}>{est.name}</div><div style={{fontSize:11,color:DS.textMuted}}>{est.location}</div><div style={{display:"flex",alignItems:"center",gap:4,marginTop:2}}><Stars r={est.rating} sz={10}/><span style={{fontSize:10,color:DS.textMuted}}>({est.reviewCount})</span></div></div><div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:900,color:DS.gold}}>{est.priceFrom} EUR</div><div style={{fontSize:9,color:DS.textMuted}}>a partir de</div></div></div></div>);}):<Emp Icon={Heart} title="Aucun favori" sub="Appuyez sur le coeur d un etablissement pour l ajouter"/>)}</div></div>);
}

function ESTAB_TABS_BUILD(isHotel,e,resaType,viewerIsPro){
  var tabs=[["about","A propos"]];
  if(isHotel)tabs.push(["amenities","Equipements"]);
  var isCombinedEstab=isHotel&&e&&e.svcMode==="combined";
  if(isCombinedEstab){
    if(viewerIsPro){
      tabs.push(["rooms","Chambres"]);
      tabs.push(["menu","Menu"]);
    }
    else if(resaType==="hotel")tabs.push(["rooms","Chambres"]);
    else if(resaType==="restaurant")tabs.push(["menu","Menu"]);
    else if(resaType==="combined")tabs.push(["combo","Sejour combine"]);
  } else {
    if(isHotel)tabs.push(["rooms","Chambres"]);
    if(!isHotel)tabs.push(["menu","Menu"]);
  }
  tabs.push(["reviews","Avis"]);
  return tabs;
}
function EstabM(props){
  var e=props.e;var rawOnClose=props.onClose;var onBook=props.onBook;var onChat=props.onChat;var viewerIsPro=props.viewerIsPro||false;
  var scl=useState(false);var closingE=scl[0];var setClosingE=scl[1];
  function onClose(){if(closingE)return;setClosingE(true);setTimeout(function(){if(rawOnClose)rawOnClose();},260);}
  var s1=useState("about");var tab=s1[0];var setTab=s1[1];
  var s2=useState(0);var rating=s2[0];var setRating=s2[1];
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
  return(<div style={{position:"fixed",inset:0,background:DS.bg,zIndex:900,maxWidth:420,margin:"0 auto",overflowY:"auto",animation:(closingE?"hp-slide-out-right 0.26s cubic-bezier(0.4,0,1,1) forwards":"hp-slide-right 0.32s cubic-bezier(0.22,1,0.36,1)"),boxShadow:"-8px 0 24px rgba(0,0,0,.35)"}}><Toast/><div style={{position:"relative",height:220,flexShrink:0}}><img src={e.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/><div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,.2),rgba(0,0,0,.6))"}}/><div style={{position:"absolute",top:12,left:12}}><BackBtn onClick={onClose} light={true}/></div>{e.verified&&<div style={{position:"absolute",bottom:12,left:12,display:"flex",alignItems:"center",gap:5}}><VBadge sz={22}/><span style={{fontSize:11,color:"#fff",fontWeight:700}}>Verifie</span></div>}</div><div style={{padding:"16px 16px 8px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}><div><div style={{fontSize:20,fontWeight:900,color:DS.text}}>{e.name}</div><div onClick={function(){window.open("https://maps.google.com/?q="+encodeURIComponent(e.name+" "+e.location));}} style={{fontSize:12,color:DS.primary,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}><MapPin size={11}/>{e.location}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:18,fontWeight:900,color:DS.gold}}>A partir de {e.priceFrom} EUR</div></div></div><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><Stars r={e.rating} sz={15}/><span style={{fontSize:13,fontWeight:800,color:DS.text}}>{e.rating}</span><span style={{fontSize:13,color:DS.textDim}}>-</span><span style={{fontSize:13,fontWeight:700,color:DS.text}}>{fmtK(followersCount)}</span><span style={{fontSize:12,color:DS.textMuted}}>abonnes</span></div><div style={{display:"flex",gap:8,marginBottom:16}}>{viewerIsPro
                ? <div style={{flex:2,padding:"9px 14px",background:DS.card,border:"1px solid "+DS.border,borderRadius:20,color:DS.textDim,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:5,minHeight:36}}><Lock size={12}/>Reservation indisponible</div>
                : <button onClick={function(){if(isCombinedEstab){setTab(resaType==="restaurant"?"menu":resaType==="combined"?"combo":"rooms");}else if(onBook){onBook(e);}}} style={{flex:2,padding:"9px 14px",background:color,border:"none",borderRadius:20,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5,minHeight:36}}><Calendar size={13}/>Reserver</button>}<button onClick={function(){if(onChat)onChat(e);if(onClose)onClose();}} style={{flex:viewerIsPro?2:1,padding:"9px 8px",background:DS.card,border:"1px solid "+DS.border,borderRadius:20,color:DS.textMuted,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4,minHeight:36}}><MessageCircle size={13}/>Chat</button><button onClick={function(){window.open("https://maps.google.com/?q="+encodeURIComponent(e.name+" "+e.location));}} style={{width:36,height:36,background:DS.card,border:"1px solid "+DS.border,borderRadius:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} title="Voir sur la carte"><MapPin size={15} color={DS.primary}/></button><button onClick={toggleFollow} style={{flex:1,padding:"9px 8px",background:isFollowing?color+"18":DS.card,border:"1px solid "+(isFollowing?color:DS.border),borderRadius:20,color:isFollowing?color:DS.textMuted,fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4,minHeight:36}}>{isFollowing?<UserCheck size={14} color={color}/>:<UserPlus size={14} color={DS.textMuted}/>}{isFollowing?"Suivi":"Suivre"}</button><button onClick={toggleFavEstab} style={{width:36,height:36,background:isFavEstab?DS.error+"18":DS.card,border:"1px solid "+(isFavEstab?DS.error+"55":DS.border),borderRadius:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"background .2s,border .2s"}}><Heart size={15} color={DS.error} fill={isFavEstab?DS.error:"none"}/></button></div>{isCombinedEstab&&!viewerIsPro&&<div style={{marginBottom:14}}><div style={{fontSize:11,fontWeight:700,color:DS.textDim,letterSpacing:1,marginBottom:6}}>TYPE DE RESERVATION</div><div style={{display:"flex",flexDirection:"column",gap:6}}>{[["hotel","Hotel uniquement"],["restaurant","Restaurant uniquement"],["combined","Reservation combinee (Hotel + Restaurant)"]].map(function(_i){var v=_i[0];var l=_i[1];var isSel=resaType===v;return(<button key={v} onClick={function(){setResaType(v);setTab(v==="restaurant"?"menu":v==="combined"?"combo":"rooms");}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,border:"1.5px solid "+(isSel?color+"66":DS.border),background:isSel?color+"0C":DS.card,cursor:"pointer",textAlign:"left"}}><div style={{width:16,height:16,borderRadius:"50%",border:"2px solid "+(isSel?color:DS.border),background:isSel?color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{isSel&&<div style={{width:6,height:6,borderRadius:"50%",background:"#fff"}}/>}</div><span style={{fontSize:12,color:isSel?color:DS.text,fontWeight:isSel?700:400}}>{l}</span></button>);})}</div></div>}<div style={{display:"flex",gap:4,marginBottom:16}}>{ESTAB_TABS_BUILD(isHotel,e,resaType,viewerIsPro).map(function(_i){var t2=_i[0];var l=_i[1];var isAct=tab===t2;return <button key={t2} onClick={function(){setTab(t2);}} style={{flex:1,padding:"8px 4px",borderRadius:10,border:"1px solid "+(isAct?color:DS.border),background:isAct?color+"18":"transparent",color:isAct?color:DS.textMuted,fontSize:11,fontWeight:700,cursor:"pointer",textAlign:"center"}}>{l}</button>;})} </div>{tab==="about"&&<div><div style={{fontSize:13,color:DS.textMuted,lineHeight:1.6}}>{e.description}</div></div>}{tab==="amenities"&&<div>{(e.services||[]).filter(function(s){return typeof s==="string"||s.active!==false;}).map(function(s,i){var nm=typeof s==="string"?s:s.name;var Ic=getIcon(nm);var actSvcs=(e.services||[]).filter(function(x){return typeof x==="string"||x.active!==false;});return(<div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:i<actSvcs.length-1?"1px solid "+DS.border+"20":"none"}}><div style={{width:28,height:28,borderRadius:8,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic size={13} color={color}/></div><span style={{fontSize:12,color:DS.text}}>{nm}</span></div>);})}</div>}{tab==="rooms"&&isHotel&&(e.rooms||[]).map(function(r){return(<div key={r.id} style={{background:DS.card,borderRadius:12,padding:"12px 14px",marginBottom:10,border:"1px solid "+DS.border}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}><div><div style={{fontSize:13,fontWeight:700,color:DS.text}}>{r.name}</div><div style={{fontSize:11,color:DS.textMuted}}>{r.capacity} personnes</div></div><div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:900,color:DS.gold}}>{r.price} EUR</div><div style={{fontSize:9,color:DS.textMuted}}>par nuit</div></div></div>{viewerIsPro
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
                  <button onClick={function(){if(viewerIsPro)return;if(comboRoom&&onBook)onBook(Object.assign({},e,{selectedRoom:comboRoom,comboMeals:comboMeals,comboTable:comboTable,comboTotal:comboTotal,isCombo:true}));else toast("Selectionnez d abord une chambre","error");}} style={{width:"100%",padding:"11px",background:comboRoom?color:DS.textDim,border:"none",borderRadius:14,color:"#fff",fontSize:13,fontWeight:800,cursor:comboRoom?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:comboRoom?1:0.6,transition:"background .2s,opacity .2s"}}>
                    <Calendar size={14}/>Reserver le sejour combine
                  </button>
                </div>
              )}
            </div>
          )}{tab==="menu"&&(resaType==="restaurant"||!isHotel)&&(
            <div>
              {(e.menu||[]).map(function(cat,ci){return(
                <div key={ci} style={{marginBottom:18}}>
                  <div style={{fontSize:12,fontWeight:800,color:color,letterSpacing:1.5,marginBottom:8}}>{cat.cat.toUpperCase()}</div>
                  {cat.items.map(function(item,ji){
                    var isSel=selectedDishes.indexOf(cat.cat+"-"+item.name)>=0;
                    return(
                      <div key={ji} onClick={function(){var k=cat.cat+"-"+item.name;setSelectedDishes(function(prev){return prev.indexOf(k)>=0?prev.filter(function(x){return x!==k;}):prev.concat([k]);});}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",marginBottom:6,borderRadius:12,border:"1.5px solid "+(isSel?color+"66":DS.border+"40"),background:isSel?color+"0C":DS.card,cursor:"pointer",transition:"all .15s"}}>
                        <div style={{width:22,height:22,borderRadius:6,border:"2px solid "+(isSel?color:DS.border),background:isSel?color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          {isSel&&<CheckCircle size={12} color="#fff"/>}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:isSel?700:500,color:isSel?color:DS.text}}>{item.name}</div>
                          {item.description&&<div style={{fontSize:10,color:DS.textMuted,marginTop:1}}>{item.description}</div>}
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontSize:14,fontWeight:900,color:DS.gold}}>{item.price} EUR</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );})}
              {selectedDishes.length>0&&(
                <div style={{position:"sticky",bottom:0,background:DS.surface,padding:"12px 0 4px",borderTop:"1px solid "+DS.border+"30"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div style={{fontSize:12,color:DS.textMuted}}>{selectedDishes.length} plat{selectedDishes.length>1?"s":""} selectionne{selectedDishes.length>1?"s":""}</div>
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
          )}{tab==="reviews"&&<div>{e.isPremium
              ? <div><div style={{marginBottom:6,fontSize:12,fontWeight:700,color:DS.text}}>Laisser un avis</div><div style={{display:"flex",gap:6,marginBottom:8}}>{[1,2,3,4,5].map(function(i){return <button key={i} onClick={function(){setRating(i);}} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><Star size={24} fill={i<=rating?"#F59E0B":"none"} color={i<=rating?"#F59E0B":DS.border} strokeWidth={1.5}/></button>;})} </div><div style={{marginTop:8,display:"flex",justifyContent:"flex-end"}}><button disabled={rating===0} onClick={function(){if(rating>0){toast("Avis publie","success");setRating(0);}}} style={{padding:"8px 20px",background:rating>0?color:DS.textDim,border:"none",borderRadius:20,color:"#fff",fontSize:12,fontWeight:700,cursor:rating>0?"pointer":"not-allowed",opacity:rating>0?1:.6}}>Publier</button></div></div>
              : <div style={{background:DS.card,border:"1px solid "+DS.border,borderRadius:12,padding:"12px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}><Lock size={16} color={DS.textDim}/><span style={{fontSize:11,color:DS.textMuted}}>Cet etablissement n a pas d abonnement Premium actif et ne peut pas encore recevoir d avis</span></div>
            }<Emp Icon={Star} title="Aucun avis" sub="Soyez le premier"/></div>}</div></div>);
}

function genQRPixels(id){
  var s=0;for(var ci=0;ci<id.length;ci++){s=((s*31+id.charCodeAt(ci))&0x7FFFFFFF)>>>0;}
  return Array.from({length:100},function(_,j){s=((s*1664525+1013904223)&0x7FFFFFFF)>>>0;return (s>>>15)&1;});
}
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
  var tk=useToast();var toast=tk.show;var Toast=tk.Toast;
  var _ridRef=useRef(null);if(!_ridRef.current){_ridRef.current="HP-"+Math.floor(100000+Math.random()*900000);}
  var resaId=_ridRef.current;
  var _today=new Date().toISOString().slice(0,10);
  var selfEmail=props.selfEmail||"";
  var clientName=selfEmail.split("@")[0]||"Client";
  var isCombo=e.isCombo===true;
  var hasDishes=e.selectedDishes&&e.selectedDishes.length>0;
  var isHotelBooking=e.type==="hotel";
  var isRestaurantBooking=e.type==="restaurant";
  var nights=isHotelBooking?nightsCount:1;
  var dateOut=isHotelBooking?(dateIn?computeDateOut(dateIn,nightsCount):""):dateIn;
  var basePrice=isCombo?e.comboTotal:(hasDishes?e.dishTotal:(e.selectedRoom?e.selectedRoom.price:e.priceFrom));
  var totalPrice=isCombo?basePrice*nights:(hasDishes?basePrice*tableCount:(isHotelBooking?basePrice*nights*roomCount:basePrice*tableCount));
  var serviceLabel=isCombo?("Sejour combine - "+e.selectedRoom.name):(hasDishes?(e.selectedDishes.length+" plat"+(e.selectedDishes.length>1?"s":"")+" selectionne"+(e.selectedDishes.length>1?"s":"")):(e.selectedRoom?e.selectedRoom.name:(e.type==="hotel"?"Chambre Standard":"Reservation")));
  var guestsLabel=isRestaurantBooking?"NOMBRE DE CONVIVES":"NOMBRE DE VOYAGEURS";
  var dateLabel=isRestaurantBooking?"DATE DE RESERVATION":"DATE D ARRIVEE";
  var qrPixels=genQRPixels(resaId);
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:1100,display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"hp-fade 0.2s ease"}}>
      <div style={{width:"100%",maxWidth:420,background:DS.surface,borderRadius:"22px 22px 0 0",border:"1px solid "+DS.border,maxHeight:"94vh",overflowY:"auto",animation:"hp-slide-up 0.3s ease"}}>
        <Toast/>
        <div style={{padding:"14px 20px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid "+DS.border}}>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:DS.text}}>Reserver</div>
            <div style={{fontSize:11,color:DS.textMuted}}>{e.name}</div>
          </div>
          <button onClick={onClose} style={{background:DS.card,border:"1px solid "+DS.border,borderRadius:"50%",width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><X size={14} color={DS.textMuted}/></button>
        </div>
        <div style={{padding:"0 20px",display:"flex",gap:4,marginTop:14,marginBottom:4}}>
          {[1,2,3,4].map(function(s){return <div key={s} style={{flex:1,height:3,borderRadius:2,background:s<=step?color:DS.border}}/>;  })}
        </div>
        <div style={{padding:"14px 20px 28px"}}>

          {/* ETAPE 1 : Dates + voyageurs/convives */}
          {step===1&&(
            <div>
              <div style={{fontSize:14,fontWeight:800,color:DS.text,marginBottom:14}}>{isRestaurantBooking?"Date et convives":"Dates et voyageurs"}</div>
              {isHotelBooking?(
                <div style={{display:"flex",gap:10,marginBottom:14}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:700,color:DS.textMuted,marginBottom:5}}>{dateLabel}</div>
                    <input type="date" min={_today} value={dateIn} onChange={function(ev){setDateIn(ev.target.value);}} style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"11px 12px",fontSize:13,color:DS.text,outline:"none",boxSizing:"border-box"}}/>
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
                <div style={{fontSize:11,color:DS.textMuted,marginBottom:10,marginTop:-8}}>Depart prevu le <span style={{color:DS.text,fontWeight:700}}>{dateOut}</span></div>
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
                    <button onClick={function(){setGuests(Math.max(1,guests-1));}} style={{width:28,height:28,borderRadius:"50%",border:"1px solid "+DS.border,background:"transparent",cursor:"pointer",fontSize:16,color:DS.text,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>-</button>
                    <span style={{flex:1,textAlign:"center",fontSize:14,fontWeight:800,color:DS.text}}>{guests} pers.</span>
                    <button onClick={function(){setGuests(Math.min(20,guests+1));}} style={{width:28,height:28,borderRadius:"50%",border:"1px solid "+DS.border,background:"transparent",cursor:"pointer",fontSize:16,color:DS.text,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>+</button>
                  </div>
                </div>
                {isHotelBooking&&!isCombo&&(
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:700,color:DS.textMuted,marginBottom:5}}>NOMBRE DE CHAMBRES</div>
                    <div style={{display:"flex",alignItems:"center",gap:10,background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"10px 12px"}}>
                      <button onClick={function(){setRoomCount(Math.max(1,roomCount-1));}} style={{width:28,height:28,borderRadius:"50%",border:"1px solid "+DS.border,background:"transparent",cursor:"pointer",fontSize:16,color:DS.text,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>-</button>
                      <span style={{flex:1,textAlign:"center",fontSize:14,fontWeight:800,color:DS.text}}>{roomCount} chbre{roomCount>1?"s":""}</span>
                      <button onClick={function(){setRoomCount(Math.min(e.selectedRoom&&e.selectedRoom.stock?e.selectedRoom.stock:10,roomCount+1));}} style={{width:28,height:28,borderRadius:"50%",border:"1px solid "+DS.border,background:"transparent",cursor:"pointer",fontSize:16,color:DS.text,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>+</button>
                    </div>
                  </div>
                )}
                {isRestaurantBooking&&(
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:700,color:DS.textMuted,marginBottom:5}}>NOMBRE DE TABLES</div>
                    <div style={{display:"flex",alignItems:"center",gap:10,background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"10px 12px"}}>
                      <button onClick={function(){setTableCount(Math.max(1,tableCount-1));}} style={{width:28,height:28,borderRadius:"50%",border:"1px solid "+DS.border,background:"transparent",cursor:"pointer",fontSize:16,color:DS.text,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>-</button>
                      <span style={{flex:1,textAlign:"center",fontSize:14,fontWeight:800,color:DS.text}}>{tableCount} table{tableCount>1?"s":""}</span>
                      <button onClick={function(){setTableCount(Math.min(10,tableCount+1));}} style={{width:28,height:28,borderRadius:"50%",border:"1px solid "+DS.border,background:"transparent",cursor:"pointer",fontSize:16,color:DS.text,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>+</button>
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
              <button onClick={function(){if(dateIn)setStep(2);else toast("Selectionnez une date","error");}} style={{width:"100%",padding:"12px",background:color,border:"none",borderRadius:12,color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer"}}>Continuer</button>
            </div>
          )}

          {/* ETAPE 2 : Paiement avec ou sans */}
          {step===2&&(
            <div>
              <div style={{fontSize:14,fontWeight:800,color:DS.text,marginBottom:6}}>Type de reservation</div>
              <div style={{fontSize:12,color:DS.textMuted,marginBottom:14}}>Choisissez de payer maintenant ou a l arrivee.</div>
              {[["avec","Reservation avec paiement","Paiement securise maintenant. Confirmation immediate.",DS.success],["sans","Reservation sans paiement","Paiement a l arrivee. Confirmation sous 24h.",DS.warning]].map(function(_i){
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
                  if(paying)return;
                  setPaying(true);
                  var delay=payMode==="avec"?1100:500;
                  setTimeout(function(){
                    var initStatus=payMode==="avec"?"confirmed":"pending";
                    var resa={id:resaId,clientName:clientName,estab:e.name,estabType:e.type,service:serviceLabel,dateIn:dateIn,dateOut:dateOut,nights:nights,guests:guests,roomCount:isCombo?1:(isHotelBooking?roomCount:null),tableCount:isRestaurantBooking?tableCount:null,total:totalPrice,payMode:payMode,payMethod:payMode==="avec"?payMethod:null,qr:resaId,status:initStatus,isCombo:isCombo,comboMeals:isCombo?e.comboMeals:null,comboTable:isCombo?e.comboTable:null};
                    setPaying(false);
                    setStep(3);
                    toast(payMode==="avec"?"Reservation confirmee !":"Demande envoyee a l etablissement !","success");
                    if(props.onBooked)props.onBooked(BookingService.createBooking(resa));
                  },delay);
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
                <div style={{width:64,height:64,borderRadius:"50%",background:payMode==="avec"?DS.successSoft:DS.warningSoft,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>{payMode==="avec"?<CheckCircle size={32} color={DS.success}/>:<Clock size={32} color={DS.warning}/>}</div>
                <div style={{fontSize:17,fontWeight:900,color:payMode==="avec"?DS.success:DS.warning}}>{payMode==="avec"?"Reservation confirmee !":"Demande envoyee !"}</div>
                <div style={{fontSize:12,color:DS.textMuted,marginTop:4}}>{payMode==="avec"?"Votre ticket numerique est pret":"En attente de confirmation de l etablissement (24h)"}</div>
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
                    ["Date",dateIn||"A confirmer"],
                    ["Paiement",payMode==="avec"?totalPrice.toFixed(0)+" EUR":"Reservation sans paiement"],
                    ["Reference",resaId],
                  ]:[
                    ["Service",serviceLabel],
                    ["Voyageurs",guests+" personne"+(guests>1?"s":"")],
                    ["Arrivee",dateIn||"A confirmer"],
                    ["Depart",dateOut||"A confirmer"],
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
                  <div style={{fontSize:10,color:DS.textMuted,marginBottom:10}}>CODE QR - A PRESENTER A L ETABLISSEMENT</div>
                  <div style={{display:"inline-flex",padding:12,background:"#fff",borderRadius:12,margin:"0 auto"}}>
                    <div style={{width:120,height:120,display:"grid",gridTemplateColumns:"repeat(10,1fr)",gap:1}}>
                      {qrPixels.map(function(px,i){return <div key={i} style={{background:px?"#000":"#fff",borderRadius:1}}/>;  })}
                    </div>
                  </div>
                  <div style={{fontSize:10,color:DS.textMuted,marginTop:8,fontFamily:"monospace"}}>{resaId}</div>
                </div>
              </div>
              <div style={{background:DS.successSoft,border:"1px solid "+DS.success+"33",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:11,color:DS.success,lineHeight:1.5,display:"flex",alignItems:"center",gap:8}}>
                <CheckCircle size={13} color={DS.success}/>{isRestaurantBooking?"Ce ticket est valide jusqu a votre arrivee. L etablissement scannera votre QR code.":"Ce ticket est valide jusqu a votre arrivee. L etablissement scannera votre QR code pour confirmer."}
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
              <div style={{fontSize:14,fontWeight:800,color:DS.text,marginBottom:14}}>Ticket de reservation</div>
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
                    ["Date","date",dateIn||"A confirmer",DS.primary],
                    ["Montant","price",payMode==="avec"?totalPrice.toFixed(0)+" EUR":"Reservation sans paiement",payMode==="avec"?DS.gold:DS.success],
                  ]:[
                    ["Type","service",serviceLabel,DS.text],
                    ["Voyageurs","guests",guests+" pers.",DS.text],
                    ["Arrivee","in",dateIn||"A confirmer",DS.primary],
                    ["Depart","out",dateOut||"A confirmer",DS.primary],
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
                  <div style={{display:"inline-flex",padding:10,background:"#fff",borderRadius:10}}>
                    <div style={{width:100,height:100,display:"grid",gridTemplateColumns:"repeat(10,1fr)",gap:1}}>
                      {qrPixels.map(function(px,i){return <div key={i} style={{background:px?"#000":"#fff"}}/>;  })}
                    </div>
                  </div>
                  <div style={{fontSize:10,color:DS.textMuted,marginTop:8,fontFamily:"monospace",letterSpacing:1}}>{resaId}</div>
                  <div style={{fontSize:10,color:DS.textDim,marginTop:4}}>Valide jusqu au scannage de l etablissement</div>
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
  var proType=props.proType;var isPremium=props.isPremium||false;var onPremium=props.onPremium;var onProfile=props.onProfile;
  // Fix #3 : data declare en premier pour eviter crash dans addCmt
  var color=rC(proType);
  var _allData=proType==="hotel"?DataLayer.getHotels():DataLayer.getRestaurants();
  var selfEmail=props.selfEmail||"";
  var data=_allData.length>0?_allData[0]:{name:selfEmail.split("@")[0]||"Pro",verified:false,followers:0,rating:0,reviewCount:0};
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
  function addCmt(id){
    var text=(cmtText[id]||"").trim();if(!text)return;
    var cm={id:Date.now(),author:data.name,text:text,time:"maintenant"};
    setPosts(function(ps){return ps.map(function(p){return p.id===id?Object.assign({},p,{comments:p.comments.concat([cm])}):p;});});
    var nc=Object.assign({},cmtText);nc[id]="";setCmtText(nc);
    toast("Commentaire publie","success");
  }
  function delCmt(postId,cmId){
    setPosts(function(ps){return ps.map(function(p){return p.id===postId?Object.assign({},p,{comments:p.comments.filter(function(cm){return cm.id!==cmId;})}):p;});});
    toast("Commentaire supprime","success");
  }
  var sm=useState(null);var menuOpen=sm[0];var setMenuOpen=sm[1];
  var sf=useState(_initFavsPro);var favPosts=sf[0];var setFavPosts=sf[1];
  var sr=useState(null);var reportTarget=sr[0];var setReportTarget=sr[1];
  // Fix #2 : toast favoris dans le bon sens
  function toggleFav(id){
    var wasFav=favPosts.indexOf(id)>=0;
    setFavPosts(function(f){var next=wasFav?f.filter(function(x){return x!==id;}):f.concat([id]);try{localStorage.setItem("hp_pro_favs",JSON.stringify(next));}catch(e){}return next;});
    setMenuOpen(null);
    toast(wasFav?"Retire des favoris":"Ajoute aux favoris","success");
  }
  function openReport(post){setMenuOpen(null);setReportTarget(post);}
  var followingPosts=props.followingIds||[];
  function toggleFollowPost(id){if(props.onToggleFollow)props.onToggleFollow(id);}
  function toggleLike(id){setPosts(function(ps){return ps.map(function(p){return p.id===id?Object.assign({},p,{liked:!p.liked,likes:p.liked?p.likes-1:p.likes+1}):p;});});}
  // Fix #6 : persistance likes Pro
  function toggleLikePro(id){
    setPosts(function(ps){
      var next=ps.map(function(p){return p.id===id?Object.assign({},p,{liked:!p.liked,likes:p.liked?p.likes-1:p.likes+1}):p;});
      try{var lk={};next.forEach(function(p){if(p.liked)lk[p.id]=1;});localStorage.setItem("hp_pro_likes",JSON.stringify(lk));}catch(e){}
      return next;
    });
  }
  function toggleCmt(id){setPosts(function(ps){return ps.map(function(p){return p.id===id?Object.assign({},p,{showCmt:!p.showCmt}):p;});});}
  function doShare(id){var p=null;for(var k=0;k<posts.length;k++){if(posts[k].id===id){p=posts[k];break;}}setSharePost(p);}
  function confirmShare(id){setPosts(function(ps){return ps.map(function(p){return p.id===id?Object.assign({},p,{shares:(p.shares||0)+1}):p;});});toast("Partage avec succes","success");}
  var smedia=useState(null);var mediaPreview=smedia[0];var setMediaPreview=smedia[1];
  var smtype=useState(null);var mediaType=smtype[0];var setMediaType=smtype[1];
  var sgate=useState(false);var showVideoGate=sgate[0];var setShowVideoGate=sgate[1];
  function pickMedia(ev){
    var file=ev.target.files&&ev.target.files[0];if(!file)return;
    var isVideo=file.type.indexOf("video")===0;
    if(isVideo&&!isPremium){setShowVideoGate(true);ev.target.value="";return;}
    var url=URL.createObjectURL(file);
    setMediaPreview(url);setMediaType(isVideo?"video":"image");
    ev.target.value="";
  }
  function removeMedia(){setMediaPreview(null);setMediaType(null);}
  function publish(){
    if(!newPost.trim()&&!mediaPreview)return;
    var newId="post-"+Date.now();
    var newObj={id:newId,author:data.name,type:proType,time:"maintenant",text:newPost,img:mediaType==="image"?mediaPreview:null,video:mediaType==="video"?mediaPreview:null,likes:0,comments:[],showCmt:false,verified:data.verified};
    setPosts(function(ps){return [newObj].concat(ps);});
    // Fix #5 : sauvegarde dans Supabase si disponible
    try{DataLayer.create("posts",[{id:newId,author:data.name,type:proType,data:newObj}]).catch(function(){});}catch(e){}
    setNewPost("");setShowNew(false);setMediaPreview(null);setMediaType(null);
  }
  return(
    <div style={{background:DS.bg,paddingBottom:24}}>
      <Toast/>
      {reportTarget&&<ReportM targetName={"la publication de "+reportTarget.author} onClose={function(){setReportTarget(null);}} onSubmit={function(){toast("Signalement envoye - Merci","success");}}/>}
      {menuOpen&&<div onClick={function(){setMenuOpen(null);}} style={{position:"fixed",inset:0,zIndex:199}}/>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",background:DS.surface,borderBottom:"1px solid "+DS.border,marginBottom:10}}>
        {[[fmtK(data.followers),"Abonnes",color],[data.rating+" *","Note",DS.gold],[fmtK(data.reviewCount),"Avis",DS.success]].map(function(_i,i){var v=_i[0];var l=_i[1];var col=_i[2];return <div key={i} style={{padding:"14px 4px",textAlign:"center",borderRight:i<2?"1px solid "+DS.border:"none"}}><div style={{fontSize:20,fontWeight:900,color:col}}>{v}</div><div style={{fontSize:10,color:DS.textMuted,marginTop:2}}>{l}</div></div>;})}
      </div>
      <div style={{background:DS.surface,borderBottom:"1px solid "+DS.border+"40",padding:"14px 16px",marginBottom:10}}>
        {!showNew
          ? <button onClick={function(){setShowNew(true);}} style={{display:"flex",alignItems:"center",gap:12,width:"100%",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
              <Av sz={46} letter={data.name[0]} verified={data.verified}/>
              <div style={{flex:1,padding:"11px 16px",border:"1px solid "+DS.border,borderRadius:28,fontSize:14,color:DS.textMuted,background:DS.card}}>Publier une mise a jour...</div>
            </button>
          : <div>
              <div style={{display:"flex",gap:12,marginBottom:12}}>
                <Av sz={46} letter={data.name[0]} verified={data.verified}/>
                <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:DS.text}}>{data.name}</div><div style={{fontSize:11,color:DS.textMuted}}>Publier maintenant</div></div>
              </div>
              <textarea value={newPost} onChange={function(e){setNewPost(e.target.value);}} placeholder="Partagez une actualite, une offre..." rows={4} style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:14,padding:"14px 16px",fontSize:15,color:DS.text,outline:"none",resize:"none",lineHeight:1.6,boxSizing:"border-box"}}/>
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
                  <Eye size={14} color={color}/>
                  <span style={{fontSize:12,color:DS.textMuted,fontWeight:600}}>Photo / Video</span>
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
                {["Publications video illimitees","Sans publicite","Eligible badge verification","Visibilite boostee"].map(function(f,i){return <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:i<3?8:0}}><CheckCircle size={13} color={DS.gold}/><span style={{fontSize:12,color:DS.textMuted}}>{f}</span></div>;})}
              </div>
              <button onClick={function(){setShowVideoGate(false);if(onPremium)onPremium();}} style={{width:"100%",padding:"12px",background:DS.gold,border:"none",borderRadius:12,color:"#000",fontSize:14,fontWeight:900,cursor:"pointer",marginBottom:10}}>Passer Premium</button>
              <button onClick={function(){setShowVideoGate(false);}} style={{width:"100%",padding:"10px",background:"transparent",border:"none",color:DS.textMuted,fontSize:12,cursor:"pointer"}}>Annuler</button>
            </div>
          </div>
        </div>
      )}
      {posts.map(function(post){
        var pc=rC(post.type);
        return(
          <div key={post.id} style={{background:DS.surface,marginBottom:10,borderTop:"1px solid "+DS.border+"28",borderBottom:"1px solid "+DS.border+"28"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12,padding:"18px 16px 14px"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12,flex:1,minWidth:0}}>
                <div onClick={function(){if(onProfile)onProfile(post.id,post.type);}} style={{cursor:onProfile?"pointer":"default",flexShrink:0}}>
                  <Av sz={52} letter={post.author[0]} verified={post.verified}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div onClick={function(){if(onProfile)onProfile(post.id,post.type);}} style={{fontSize:15,fontWeight:800,color:DS.text,lineHeight:1.3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",cursor:onProfile?"pointer":"default",display:"inline-block",maxWidth:"100%"}}>{post.author}</div>
                  <div style={{display:"flex",flexWrap:"nowrap",alignItems:"center",gap:5,marginTop:2,overflow:"hidden"}}>
                    <span style={{fontSize:12,color:pc,fontWeight:700,flexShrink:0,whiteSpace:"nowrap"}}>{post.type==="hotel"?"Hotel":"Restaurant"}</span>
                    {post.combined&&<span style={{fontSize:9,color:DS.primary,fontWeight:800,background:DS.primarySoft,borderRadius:8,padding:"1px 6px",flexShrink:0,whiteSpace:"nowrap"}}>+ Restaurant</span>}
                    <span style={{fontSize:12,color:DS.textMuted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0}}>{post.followers?"- "+fmtK(post.followers)+" abonnes":""}</span>
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
            {post.img&&<img src={post.img} alt="" onError={function(e){e.target.style.display="none";}} style={{width:"100%",minHeight:380,maxHeight:620,objectFit:"cover",display:"block"}}/>}{post.video&&<video src={post.video} controls style={{width:"100%",maxHeight:620,display:"block",background:"#000"}}/>}
            <div style={{display:"flex",justifyContent:"space-between",padding:"12px 16px 2px",fontSize:12,color:DS.textDim}}>
              <span>{post.likes} reaction{post.likes!==1?"s":""}</span>
              <span style={{cursor:"pointer"}} onClick={function(){toggleCmt(post.id);}}>{post.comments.length} commentaire{post.comments.length!==1?"s":""}</span><span>{post.shares||0} partage{(post.shares||0)!==1?"s":""}</span>
            </div>
            <div style={{display:"flex",borderTop:"1px solid "+DS.border+"30",marginTop:8}}>
              {[["Liker",Heart,post.liked?DS.error:DS.textMuted,function(){toggleLikePro(post.id);}],["Commenter",MessageCircle,DS.textMuted,function(){toggleCmt(post.id);}],["Partager",Share2,DS.textMuted,function(){doShare(post.id);}]].map(function(_i){
                var lb=_i[0];var Icon=_i[1];var col=_i[2];var fn=_i[3];
                return(
                  <button key={lb} onClick={fn} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"13px 0",background:"none",border:"none",cursor:"pointer",color:col,fontSize:13}}>
                    <Icon size={20} fill={lb==="Liker"&&post.liked?DS.error:"none"} color={col}/>{lb}
                  </button>
                );
              })}
            </div>
            {post.showCmt&&(
              <CommentsSheet post={post} cmtText={cmtText} setCmtText={setCmtText} addCmt={addCmt} delCmt={delCmt} selfLetter={data.name[0]} selfName={data.name} onClose={function(){toggleCmt(post.id);}}/>
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
  var s1=useState(1);var step=s1[0];var setStep=s1[1];
  var s2=useState(null);var reason=s2[0];var setReason=s2[1];
  var s3=useState("");var details=s3[0];var setDetails=s3[1];
  var REASONS=[
    ["spam","Spam ou contenu trompeur"],
    ["inappropriate","Contenu inapproprie ou choquant"],
    ["fake","Fausse information"],
    ["abuse","Comportement abusif ou harcelement"],
    ["scam","Escroquerie ou arnaque"],
    ["other","Autre raison"],
  ];
  function submit(){if(onSubmit)onSubmit(reason,details);setStep(3);}
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.9)",zIndex:1400,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:420,background:DS.surface,borderRadius:"22px 22px 0 0",border:"1px solid "+DS.border,maxHeight:"88vh",overflowY:"auto",animation:"hp-slide-up 0.3s ease"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid "+DS.border,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:DS.text}}>Signaler {targetName}</div>
            <div style={{fontSize:11,color:DS.textMuted,marginTop:2}}>Votre signalement reste confidentiel</div>
          </div>
          <button onClick={onClose} style={{background:DS.card,border:"1px solid "+DS.border,borderRadius:"50%",width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={14} color={DS.textMuted}/></button>
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
              <div style={{fontSize:13,fontWeight:700,color:DS.text,marginBottom:6}}>Details supplementaires (facultatif)</div>
              <div style={{fontSize:11,color:DS.textMuted,marginBottom:12}}>Aidez-nous a mieux comprendre le probleme.</div>
              <textarea value={details} onChange={function(e){setDetails(e.target.value);}} placeholder="Decrivez le probleme..." rows={4} style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"11px 14px",fontSize:13,color:DS.text,outline:"none",resize:"none",lineHeight:1.5,boxSizing:"border-box",marginBottom:16}}/>
              <div style={{background:DS.warningSoft,border:"1px solid "+DS.warning+"33",borderRadius:10,padding:"10px 14px",marginBottom:18,fontSize:11,color:DS.warning,lineHeight:1.5}}>
                Les faux signalements repetes peuvent entrainer des restrictions sur votre compte.
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
              <div style={{fontSize:16,fontWeight:800,color:DS.success,marginBottom:8}}>Signalement envoye</div>
              <div style={{fontSize:13,color:DS.textMuted,lineHeight:1.6,marginBottom:20}}>Notre equipe de moderation va examiner ce contenu sous 24-48h. Merci de contribuer a la securite de la communaute.</div>
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
  var CAT_ROOM=["Standard","Superieure","Deluxe","Suite","Bungalow"];
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
      <div style={{width:"100%",maxWidth:420,background:DS.surface,borderRadius:"22px 22px 0 0",border:"1px solid "+DS.border,maxHeight:"92vh",overflowY:"auto",animation:"hp-slide-up 0.3s ease"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid "+DS.border,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:DS.text}}>{initial?"Modifier":"Ajouter"} {isRoom?"une chambre":"un plat"}</div>
            <div style={{fontSize:11,color:DS.textMuted,marginTop:2}}>{isRoom?"Hotel":"Restaurant"} - Gestion des services</div>
          </div>
          <button onClick={onClose} style={{background:DS.card,border:"1px solid "+DS.border,borderRadius:"50%",width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={14} color={DS.textMuted}/></button>
        </div>
        <div style={{padding:20}}>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:DS.textMuted,marginBottom:5}}>{isRoom?"NOM DE LA CHAMBRE":"NOM DU PLAT"}</div>
            <input value={name} onChange={function(e){setName(e.target.value);}} placeholder={isRoom?"Ex: Suite Presidentiell":"Ex: Thieboudienne Royal"} style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"11px 14px",fontSize:13,color:DS.text,outline:"none",boxSizing:"border-box"}}/>
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
              {initial?"Mettre a jour":"Ajouter le service"}
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
    ?["Registre de commerce","Patente ou licence hotelier","Document d identite du gerant","Justificatif adresse etablissement"]
    :["Registre de commerce","Autorisation d ouverture","Document d identite du gerant","Justificatif adresse etablissement"];
  function setDocFile(d,fileName){setDocs(function(prev){var next=Object.assign({},prev);next[d]=fileName;return next;});}
  function removeDocFile(d){setDocs(function(prev){var next=Object.assign({},prev);delete next[d];return next;});}
  function docCount(){return Object.keys(docs).length;}
  function submit(){if(onSubmit)onSubmit();setStep(4);}
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",zIndex:1400,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:420,background:DS.surface,borderRadius:"22px 22px 0 0",border:"1px solid "+DS.border,maxHeight:"94vh",overflowY:"auto",animation:"hp-slide-up 0.3s ease"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid "+DS.border,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:DS.text}}>Badge de Verification</div>
            <div style={{fontSize:11,color:DS.textMuted,marginTop:2}}>Processus officiel HotelPlatform Travel</div>
          </div>
          <button onClick={onClose} style={{background:DS.card,border:"1px solid "+DS.border,borderRadius:"50%",width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={14} color={DS.textMuted}/></button>
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
                {["Publications video","Eligible badge verification","Visibilite boostee","Eligible avis clients"].map(function(f,i){return <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:i<3?8:0}}><CheckCircle size={13} color={DS.gold}/><span style={{fontSize:12,color:DS.textMuted}}>{f}</span></div>;})}
              </div>
              <button onClick={onClose} style={{width:"100%",padding:"11px",background:DS.gold,border:"none",borderRadius:12,color:"#000",fontSize:13,fontWeight:900,cursor:"pointer"}}>Obtenir Premium</button>
            </div>
          )}
          {step===1&&isPremium&&(
            <div>
              <div style={{background:color+"12",border:"1px solid "+color+"33",borderRadius:12,padding:"14px 16px",marginBottom:18}}>
                <div style={{fontSize:14,fontWeight:800,color:color,marginBottom:8}}>Processus de verification</div>
                {[["1","Soumission des documents justificatifs","Vous transmettez vos documents officiels"],["2","Controle administratif","Notre equipe verifie vos informations sous 48-72h"],["3","Validation ou refus","Vous etes notifie du resultat par email et dans l app"],["4","Badge public","Le badge s affiche sur votre profil apres validation"]].map(function(_i){var n=_i[0];var t=_i[1];var s=_i[2];return(<div key={n} style={{display:"flex",gap:10,marginBottom:12}}><div style={{width:24,height:24,borderRadius:"50%",background:color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,fontWeight:800,color:"#fff"}}>{n}</div><div><div style={{fontSize:13,fontWeight:700,color:DS.text}}>{t}</div><div style={{fontSize:11,color:DS.textMuted,marginTop:2}}>{s}</div></div></div>);})}
              </div>
              <div style={{background:DS.warningSoft,border:"1px solid "+DS.warning+"33",borderRadius:10,padding:"10px 14px",marginBottom:18,fontSize:12,color:DS.warning}}>
                Toute fausse declaration entraine le refus definitif et la suspension du compte.
              </div>
              <button onClick={function(){setStep(2);}} style={{width:"100%",padding:"11px",background:color,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer"}}>Commencer la demande</button>
            </div>
          )}
          {step===2&&(
            <div>
              <div style={{fontSize:14,fontWeight:800,color:DS.text,marginBottom:14}}>Informations officielles</div>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:700,color:DS.textMuted,marginBottom:5}}>NOM OFFICIEL DE L ETABLISSEMENT</div>
                <input value={bizName} onChange={function(e){setBizName(e.target.value);}} placeholder="Nom exact sur les documents officiels" style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"11px 14px",fontSize:13,color:DS.text,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:700,color:DS.textMuted,marginBottom:5}}>NUMERO D ENREGISTREMENT</div>
                <input value={regNum} onChange={function(e){setRegNum(e.target.value);}} placeholder="RCCM / Patente / Numero officiel" style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"11px 14px",fontSize:13,color:DS.text,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:700,color:DS.textMuted,marginBottom:5}}>PAYS</div>
                <input value={country} onChange={function(e){setCountry(e.target.value);}} placeholder="Ex: Senegal, Cote d Ivoire..." style={{width:"100%",background:DS.card,border:"1px solid "+DS.border,borderRadius:10,padding:"11px 14px",fontSize:13,color:DS.text,outline:"none",boxSizing:"border-box"}}/>
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
              <div style={{fontSize:12,color:DS.textMuted,marginBottom:14}}>Televersez vos documents officiels (PDF, JPG ou PNG). Ils seront examines par notre equipe.</div>
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
                Apres soumission, notre equipe vous contactera a : {contact||"votre email enregistre"}
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
              <div style={{fontSize:13,color:DS.textMuted,lineHeight:1.65,marginBottom:20}}>Notre equipe examine votre dossier sous 48-72h. Vous serez notifie par email et dans l application.</div>
              <div style={{background:DS.card,border:"1px solid "+DS.border,borderRadius:12,padding:"12px 16px",marginBottom:20,textAlign:"left"}}>
                <div style={{fontSize:11,fontWeight:700,color:DS.textDim,letterSpacing:1,marginBottom:8}}>RECAPITULATIF</div>
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
  var color=DS.hotel;
  var s1=useState(data.rooms||[]);var rooms=s1[0];var setRooms=s1[1];
  var s2=useState(null);var editItem=s2[0];var setEditItem=s2[1];
  var s3=useState(false);var showAdd=s3[0];var setShowAdd=s3[1];
  var s4=useState(data.svcMode||"hotel");var svcMode=s4[0];var setSvcMode=s4[1];
  var hasResto=svcMode==="combined";
  var s5=useState([]);var menu=s5[0];var setMenu=s5[1];
  var s6=useState(data.svcMode==="restaurant"?"menu":"rooms");var tab=s6[0];var setTab=s6[1];
  var sa=useState((data.services||[]).map(function(s,i){return typeof s==="object"?Object.assign({},s):{id:"svc"+i,name:s,active:true};}));
  var amenities=sa[0];var setAmenities=sa[1];
  var sb=useState(false);var addSvc=sb[0];var setAddSvc=sb[1];
  var sc=useState("");var newSvcName=sc[0];var setNewSvcName=sc[1];
  function toggleAmenity(id){setAmenities(function(am){return am.map(function(a){return a.id===id?Object.assign({},a,{active:!a.active}):a;});});}
  function addAmenity(){if(!newSvcName.trim())return;var am=amenities.concat([{id:"svc"+Date.now(),name:newSvcName.trim(),active:true}]);setAmenities(am);setNewSvcName("");setAddSvc(false);}
  function removeAmenity(id){setAmenities(function(am){return am.filter(function(a){return a.id!==id;});});}
  function toggleAvail(id){setRooms(function(rs){return rs.map(function(r){return r.id===id?Object.assign({},r,{available:!r.available}):r;});});}
  function toggleMenuAvail(id){setMenu(function(ms){return ms.map(function(m){return m.id===id?Object.assign({},m,{available:!m.available}):m;});});}
  function saveRoom(item){
    if(editItem){setRooms(function(rs){return rs.map(function(r){return r.id===item.id?item:r;});});}
    else{setRooms(function(rs){return rs.concat([item]);});}
    setEditItem(null);setShowAdd(false);
  }
  function saveDish(item){
    if(editItem){setMenu(function(ms){return ms.map(function(m){return m.id===item.id?item:m;});});}
    else{setMenu(function(ms){return ms.concat([item]);});}
    setEditItem(null);setShowAdd(false);
  }
  function deleteRoom(id){setRooms(function(rs){return rs.filter(function(r){return r.id!==id;});});}
  function deleteDish(id){setMenu(function(ms){return ms.filter(function(m){return m.id!==id;});});}
  return(
    <div style={{background:DS.bg,paddingBottom:20}}>
      {(showAdd||editItem)&&<ServiceConfigModal mode={tab==="rooms"?"room":"dish"} color={tab==="rooms"?DS.hotel:DS.restaurant} initial={editItem} onClose={function(){setShowAdd(false);setEditItem(null);}} onSave={tab==="rooms"?saveRoom:saveDish}/>}
      <div style={{background:DS.surface,borderBottom:"1px solid "+DS.border,padding:"12px 14px 10px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{fontSize:14,fontWeight:800,color:DS.text}}>Gestion des services</div>
        </div>
        <div style={{marginBottom:10}}>
          <div style={{fontSize:10,fontWeight:700,color:DS.textDim,letterSpacing:1,marginBottom:6}}>TYPE D ETABLISSEMENT</div>
          <div style={{display:"flex",gap:6}}>
            {[["hotel","Hotel uniquement",DS.hotel],["restaurant","Restaurant uniquement",DS.restaurant],["combined","Hotel + Restaurant",DS.primary]].map(function(_i){
              var v=_i[0];var l=_i[1];var col=_i[2];var isSel=svcMode===v;
              return(
                <button key={v} onClick={function(){setSvcMode(v);if(v==="hotel")setTab("rooms");if(v==="restaurant")setTab("menu");}} style={{flex:1,padding:"8px 6px",borderRadius:10,border:"1.5px solid "+(isSel?col:DS.border),background:isSel?col+"18":"transparent",cursor:"pointer",textAlign:"center"}}>
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
                  <button onClick={function(){deleteRoom(r.id);}} style={{padding:"5px 12px",background:DS.errorSoft,border:"none",borderRadius:8,color:DS.error,fontSize:11,fontWeight:700,cursor:"pointer"}}>Supprimer</button>
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
                      <button onClick={function(){deleteDish(m.id);}} style={{padding:"5px 12px",background:DS.errorSoft,border:"none",borderRadius:8,color:DS.error,fontSize:11,fontWeight:700,cursor:"pointer"}}>Supprimer</button>
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
              <button onClick={function(){removeAmenity(am.id);}} style={{background:"none",border:"none",cursor:"pointer",padding:4,color:DS.error,opacity:.7}}><X size={12} color={DS.error}/></button>
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
  var s1=useState((data.menu||[]).reduce(function(acc,cat){return acc.concat(cat.items.map(function(item){return Object.assign({},item,{id:"d"+Date.now()+Math.random(),category:cat.cat,available:true});}));},[]));
  var items=s1[0];var setItems=s1[1];
  var s2=useState(null);var editItem=s2[0];var setEditItem=s2[1];
  var s3=useState(false);var showAdd=s3[0];var setShowAdd=s3[1];
  var s4=useState((data.offers||[]).map(function(o,i){return Object.assign({},{id:"o"+i,name:typeof o==="string"?o:o.name,price:typeof o==="object"&&o.price?o.price:null,available:true});}));
  var offers=s4[0];var setOffers=s4[1];
  var s5=useState("menu");var tab=s5[0];var setTab=s5[1];
  function saveItem(item){
    if(editItem){setItems(function(is){return is.map(function(i){return i.id===item.id?item:i;});});}
    else{setItems(function(is){return is.concat([item]);});}
    setEditItem(null);setShowAdd(false);
  }
  function deleteItem(id){setItems(function(is){return is.filter(function(i){return i.id!==id;});});}
  function toggleAvail(id){setItems(function(is){return is.map(function(i){return i.id===id?Object.assign({},i,{available:!i.available}):i;});});}
  var categories=items.reduce(function(acc,item){if(item.category&&acc.indexOf(item.category)<0)acc.push(item.category);return acc;},[]);
  return(
    <div style={{background:DS.bg,paddingBottom:20}}>
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
            {offers.map(function(o){return(
              <div key={o.id} style={{background:DS.card,borderRadius:12,padding:"12px 14px",marginBottom:10,border:"1px solid "+DS.border,display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:10,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Tag size={16} color={color}/></div>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:DS.text}}>{o.name}</div>{o.price&&<div style={{fontSize:12,color:DS.gold,fontWeight:700}}>{o.price} EUR</div>}</div>
              </div>
            );})}
            {offers.length===0&&<Emp Icon={Tag} title="Aucune offre" sub="Les offres speciales apparaitront ici"/>}
          </div>
        )}
      </div>
    </div>
  );
}
function ProResa(props){
  var proType=props.proType;var onOpenChat=props.onOpenChat;
  var clientPrivacySettings=props.clientPrivacySettings||{locked:false,msgPermission:"everyone"};
  var selfEmail=props.selfEmail||"";
  var CONNECTED_CLIENT_NAME=selfEmail.split("@")[0]||"Client";
  var color=rC(proType);
  var _liveResas=BookingService.getAll().map(function(r){return {id:r.id,client:r.clientName||CONNECTED_CLIENT_NAME,service:r.service||"Reservation",dateIn:r.dateIn||"",dateOut:r.dateOut||r.dateIn||"",nights:r.nights||1,guests:r.guests||1,total:r.total||0,payMode:r.payMode||"sans",status:r.status||"pending",qrScanned:r.status==="consumed"};});
  var s1=useState(function(){
    return _liveResas.concat([
      {id:"R001",client:"Aicha Mbaye",service:"Suite Presidentielle",dateIn:"2025-07-24",dateOut:"2025-07-27",nights:3,guests:2,total:1350,payMode:"avec",status:"confirmed",qrScanned:false},
      {id:"R002",client:"Ibrahima Diop",service:"Chambre Superieure",dateIn:"2025-07-22",dateOut:"2025-07-24",nights:2,guests:4,total:480,payMode:"avec",status:"pending",qrScanned:false},
      {id:"R003",client:"Fatou Sene",service:"Chambre Deluxe",dateIn:"2025-07-21",dateOut:"2025-07-22",nights:1,guests:1,total:0,payMode:"sans",status:"completed",qrScanned:true},
    ]);
  });
  var resas=s1[0];var setResas=s1[1];
  var s2=useState("all");var filter=s2[0];var setFilter=s2[1];
  var s3=useState(null);var scanTarget=s3[0];var setScanTarget=s3[1];
  var filtered=filter==="all"?resas:resas.filter(function(r){return r.status===filter;});
  var sColors={confirmed:DS.success,pending:DS.warning,completed:DS.primary,refused:DS.error,consumed:DS.textDim};
  var sLabels={confirmed:"Confirmee",pending:"En attente",completed:"Terminee",refused:"Refusee",consumed:"Consommee"};
  function confirmResa(id){setResas(function(rs){return rs.map(function(x){return x.id===id?Object.assign({},x,{status:"confirmed"}):x;});});}
  function refuseResa(id){setResas(function(rs){return rs.map(function(x){return x.id===id?Object.assign({},x,{status:"refused"}):x;});});}
  function scanQR(id){setResas(function(rs){return rs.map(function(x){return x.id===id?Object.assign({},x,{qrScanned:true,status:"consumed"}):x;});});setScanTarget(null);}
  return(
    <div style={{background:DS.bg,paddingBottom:20}}>
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
                    {[1,1,1,1,0,1,0,1,1,1,1,0,0,1,0,0,1,0,0,1,1,0,1,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,0,1,1,1,1,1,0,1,0,1,1,1,0,0,0,0,1,0,1,0,0,0,1,1,0,1,0,1,0,1,1,0,0,0,1,0,0,0,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0,1,1,1,0,1,0,1,1,1].map(function(px,i){return <div key={i} style={{background:px?"#000":"#fff"}}/>;  })}
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
                <button onClick={function(){scanQR(scanTarget.id);}} style={{flex:2,padding:"11px",background:DS.success,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer"}}>Confirmer l arrivee</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,padding:"14px 14px 10px"}}>
        {[[resas.filter(function(r){return r.status==="pending";}).length,"En attente",DS.warning],[resas.filter(function(r){return r.status==="confirmed";}).length,"Confirmees",DS.success],[resas.reduce(function(a,r){return a+(r.payMode==="avec"?r.total:0);},0)+" EUR","Revenus",DS.gold]].map(function(_i,i){var n=_i[0];var l=_i[1];var col=_i[2];return <div key={i} style={{background:DS.card,borderRadius:10,padding:"10px 6px",border:"1px solid "+DS.border,textAlign:"center"}}><div style={{fontSize:16,fontWeight:900,color:col}}>{n}</div><div style={{fontSize:10,color:DS.textMuted,marginTop:2}}>{l}</div></div>;})}
      </div>
      <div style={{display:"flex",gap:5,padding:"0 14px",marginBottom:12,overflowX:"auto"}}>
        {[["all","Toutes"],["pending","En attente"],["confirmed","Confirmees"],["completed","Terminees"],["consumed","Consommees"]].map(function(_i){var v=_i[0];var l=_i[1];var isAct=filter===v;return <button key={v} onClick={function(){setFilter(v);}} style={{padding:"6px 12px",borderRadius:20,border:"1px solid "+(isAct?color:DS.border),background:isAct?color+"18":"transparent",color:isAct?color:DS.textMuted,fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>{l}</button>;})}
      </div>
      <div style={{padding:"0 14px"}}>
        {filtered.map(function(r){return(
          <div key={r.id} style={{background:DS.card,borderRadius:14,padding:"14px",marginBottom:12,border:"1px solid "+(r.qrScanned?DS.textDim+"44":DS.border),opacity:r.status==="consumed"?0.7:1}}>
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
            {r.qrScanned&&<div style={{background:DS.successSoft,border:"1px solid "+DS.success+"33",borderRadius:8,padding:"6px 10px",marginBottom:8,display:"flex",alignItems:"center",gap:6}}><CheckCircle size={12} color={DS.success}/><span style={{fontSize:11,color:DS.success,fontWeight:700}}>Cette reservation est desormais consommee</span></div>}
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {r.status==="pending"&&<button onClick={function(){confirmResa(r.id);}} style={{padding:"7px 14px",background:DS.successSoft,border:"1px solid "+DS.success+"33",borderRadius:8,color:DS.success,fontSize:11,fontWeight:700,cursor:"pointer"}}>Confirmer</button>}
              {r.status==="pending"&&<button onClick={function(){refuseResa(r.id);}} style={{padding:"7px 14px",background:DS.errorSoft,border:"1px solid "+DS.error+"33",borderRadius:8,color:DS.error,fontSize:11,fontWeight:700,cursor:"pointer"}}>Refuser</button>}
              {r.status==="confirmed"&&!r.qrScanned&&<button onClick={function(){setScanTarget(r);}} style={{padding:"7px 14px",background:color+"18",border:"1px solid "+color+"44",borderRadius:8,color:color,fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}><Eye size={12}/>Scanner QR</button>}
              {(r.client!==CONNECTED_CLIENT_NAME||clientPrivacySettings.msgPermission!=="none")
                ? <button onClick={onOpenChat} style={{padding:"7px 14px",background:DS.card,border:"1px solid "+DS.border,borderRadius:8,color:DS.textMuted,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}><MessageCircle size={12}/>Chat</button>
                : <div style={{padding:"7px 14px",background:DS.card,border:"1px solid "+DS.border,borderRadius:8,color:DS.textDim,fontSize:10,display:"flex",alignItems:"center",gap:5}}><Lock size={11}/>Messages bloques</div>
              }
            </div>
          </div>
        );})}
        {filtered.length===0&&<Emp Icon={Calendar} title="Aucune reservation" sub="Les demandes apparaitront ici"/>}
      </div>
    </div>
  );
}
function ProProf(props){
  var proType=props.proType;var onSettings=props.onSettings;var onPremium=props.onPremium;var isPremium=props.isPremium||false;var onPrivacy=props.onPrivacy;var resaHistory=props.resaHistory||[];var premiumData=props.premiumData||null;var onRenewPremium=props.onRenewPremium;
  var data=proType==="hotel"?DataLayer.getHotels()[0]:DataLayer.getRestaurants()[0];var color=rC(proType);
  var s1=useState("about");var tab=s1[0];var setTab=s1[1];
  var s2=useState(false);var showVerif=s2[0];var setShowVerif=s2[1];
  var s3=useState(null);var verifStatus=s3[0];var setVerifStatus=s3[1];
  useEffect(function(){
    if(verifStatus==="pending"){
      var timer=setTimeout(function(){
        setVerifStatus("approved");
        toastP("Votre badge de verification a ete valide !","success");
      },6000);
      return function(){clearTimeout(timer);};
    }
  },[verifStatus]);
  var sd=useState(data.description);var description=sd[0];var setDescription=sd[1];
  var se=useState(false);var editingAbout=se[0];var setEditingAbout=se[1];
  var sdv=useState(data.description);var draftDesc=sdv[0];var setDraftDesc=sdv[1];
  var tkp=useToast();var toastP=tkp.show;var ToastP=tkp.Toast;
  function saveAbout(){if(!draftDesc.trim())return;setDescription(draftDesc.trim());setEditingAbout(false);toastP("A propos mis a jour","success");}
  var premiumActive=isPremium||data.isPremium;
  var isVerified=data.verified||(verifStatus==="approved");
  return(
    <div style={{paddingBottom:20}}>
      <ToastP/>
      {showVerif&&<VerifRequestModal isPremium={premiumActive} accType={proType} verifyStatus={verifStatus} initialStep={3} prefillName={data.name} prefillCountry={data.location} onClose={function(){setShowVerif(false);}} onSubmit={function(){setVerifStatus("pending");}}/>}
      <div style={{position:"relative",height:120,flexShrink:0}}>
        <img src={data.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 40%,rgba(0,0,0,.6))"}}/>
        <div style={{position:"absolute",bottom:8,left:14,display:"flex",alignItems:"center",gap:6}}>
          {isVerified&&<VBadge sz={18}/>}
          {verifStatus==="pending"&&<div style={{background:DS.warning+"22",border:"1px solid "+DS.warning+"44",borderRadius:20,padding:"2px 8px"}}><span style={{fontSize:10,color:DS.warning,fontWeight:700}}>En attente</span></div>}
        </div>
        <div style={{position:"absolute",top:8,right:8,display:"flex",gap:6}}>
          <button onClick={function(){if(onSettings)onSettings();}} style={{background:"rgba(0,0,0,.5)",border:"none",borderRadius:"50%",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><Settings size={14} color="#fff"/></button>
          {!premiumActive&&<div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:10,color:DS.gold,fontWeight:700,fontStyle:"italic"}}>Debloquez les avis clients !</span><button onClick={function(){if(onPremium)onPremium();}} style={{background:DS.gold,border:"none",borderRadius:20,padding:"6px 12px",color:"#000",fontSize:11,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap"}}>Premium</button></div>}
        {premiumActive&&premiumData&&<button onClick={function(){if(onRenewPremium)onRenewPremium();}} style={{display:"flex",alignItems:"center",gap:5,background:DS.goldSoft,border:"1px solid "+DS.gold+"33",borderRadius:20,padding:"6px 12px",color:DS.gold,fontSize:10,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}><VBadge sz={11}/>Actif jusqu au {new Date(premiumData.expiresAt).toLocaleDateString("fr-FR")}</button>}
        </div>
      </div>
      <div style={{padding:"14px 16px 10px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
          <div style={{fontSize:20,fontWeight:900,color:DS.text}}>{data.name}</div>
        </div>
        <div style={{fontSize:12,color:DS.textMuted,marginBottom:10}}>{data.location}</div>
        {!isVerified&&!verifStatus&&(
          <button onClick={function(){if(premiumActive){setShowVerif(true);}else{if(onPremium)onPremium();}}} style={{width:"100%",padding:"10px 14px",background:premiumActive?"transparent":DS.card,border:"1px solid "+(premiumActive?color+"44":DS.border),borderRadius:12,color:premiumActive?color:DS.textDim,fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:12}}>
            {premiumActive?<ShieldCheck size={14}/>:<Lock size={14}/>} <span style={{color:DS.success}}>Gagner un badge officiel pour ta credibilite</span>
          </button>
        )}
        {verifStatus==="pending"&&(
          <div style={{background:DS.warningSoft,border:"1px solid "+DS.warning+"33",borderRadius:12,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
            <AlertTriangle size={14} color={DS.warning}/>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:DS.warning}}>Verification en cours</div><div style={{fontSize:11,color:DS.textMuted}}>Reponse sous 48-72h</div></div>
          </div>
        )}
        {isVerified&&!verifStatus&&(
          <div style={{background:DS.successSoft,border:"1px solid "+DS.success+"33",borderRadius:12,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
            <ShieldCheck size={14} color={DS.success}/>
            <div style={{fontSize:12,fontWeight:700,color:DS.success}}>Etablissement verifie</div>
          </div>
        )}
        <div style={{display:"flex",gap:7,marginBottom:12}}>
          {[[fmtK(data.followers),"Abonnes"],[data.rating+" *","Note"],[fmtK(data.reviewCount),"Avis"],[data.priceFrom+" EUR","Depuis"]].map(function(_i,i){var v=_i[0];var l=_i[1];return <div key={i} style={{flex:1,background:DS.card,borderRadius:9,padding:"7px 0",textAlign:"center",border:"1px solid "+DS.border}}><div style={{fontSize:12,fontWeight:800,color:DS.text}}>{v}</div><div style={{fontSize:9,color:DS.textMuted}}>{l}</div></div>;})}
        </div>
        <div style={{display:"flex",gap:4,marginBottom:14}}>
          {[["about","A propos"],["services","Services"],["stats","Stats"]].map(function(_i){var t=_i[0];var l=_i[1];var isAct=tab===t;return <button key={t} onClick={function(){setTab(t);}} style={{flex:1,padding:"7px",borderRadius:10,border:"1px solid "+(isAct?color:DS.border),background:isAct?color+"18":"transparent",color:isAct?color:DS.textMuted,fontSize:11,fontWeight:700,cursor:"pointer",textAlign:"center"}}>{l}</button>;})}
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
        {tab==="services"&&(data.services||data.offers||[]).map(function(s,i){var name=typeof s==="string"?s:s.name;var Ic=getIcon(name);return <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid "+DS.border+"20"}}><div style={{width:30,height:30,borderRadius:8,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic size={13} color={color}/></div><div style={{fontSize:12,color:DS.text}}>{name}</div></div>;})}
        {tab==="stats"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{[["Vues","1,247",color],["Reservations","89",DS.success],["Conversion","7.1%",DS.gold],["Avis ce mois","12",DS.primary]].map(function(_i){var l=_i[0];var v=_i[1];var col=_i[2];return <div key={l} style={{background:DS.card,borderRadius:10,padding:"10px",border:"1px solid "+DS.border}}><div style={{fontSize:16,fontWeight:900,color:col}}>{v}</div><div style={{fontSize:10,color:DS.textMuted}}>{l}</div></div>;})} </div>}
      </div>
    </div>
  );
}
// == NOTIFICATION DATA (NC = client, NP = pro) ==
var NC_DATA = [];
var NP_DATA = [];

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
        setAuth(AuthService.buildSession(accType, status, session.user.email, session.user.id));
      }
    }).catch(function(){});
    var sub = sb.auth.onAuthStateChange(function(event, session){
      if(event==="SIGNED_IN" && session && session.user){
        var meta = session.user.user_metadata || {};
        var accType = meta.account_type || "client";
        var status = accType !== "client" ? "pending" : "active";
        setAuth(function(prev){
          if(prev) return prev;
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
  var s9=useState(false); var showPrivacy=s9[0];    var setShowPrivacy=s9[1];
  var s9b=useState({locked:false,pseudo:false,vis:"public",msgPermission:"everyone"});var privacySettings=s9b[0];var setPrivacySettings=s9b[1];
  function updatePrivacy(patch){setPrivacySettings(function(prev){return Object.assign({},prev,patch);});}
  var s10=useState(null);var premiumData=s10[0];    var setPremiumData=s10[1];
  var isPremium=premiumData!==null && new Date(premiumData.expiresAt)>new Date();
  function subscribePremium(plan,durationMonths){
    var now=new Date();
    var exp=new Date(now);
    exp.setMonth(exp.getMonth()+durationMonths);
    setPremiumData({plan:plan,durationMonths:durationMonths,startedAt:now.toISOString(),expiresAt:exp.toISOString()});
    setShowPremium(false);
    tk.show("Premium actif jusqu au "+exp.toLocaleDateString("fr-FR"),"success");
  }
  function renewPremium(){
    if(!premiumData)return;
    var base=new Date(premiumData.expiresAt)>new Date()?new Date(premiumData.expiresAt):new Date();
    var exp=new Date(base);
    exp.setMonth(exp.getMonth()+premiumData.durationMonths);
    setPremiumData(Object.assign({},premiumData,{expiresAt:exp.toISOString()}));
    tk.show("Abonnement renouvele jusqu au "+exp.toLocaleDateString("fr-FR"),"success");
  }
  function cancelPremium(){
    setPremiumData(null);
    tk.show("Abonnement Premium annule","success");
  }
  var s11=useState(function(){try{return JSON.parse(localStorage.getItem("hp_resas")||"[]");}catch(e){return[];}});
  var resaHistory=s11[0];   var setResaHistory=s11[1];
  var s12=useState(function(){try{return JSON.parse(localStorage.getItem("hp_following")||"[]");}catch(e){return[];}});
  var followingIds=s12[0];  var setFollowingIds=s12[1];
  var s13fav=useState(function(){try{return JSON.parse(localStorage.getItem("hp_fav_estabs")||"[]");}catch(e){return[];}});
  var favEstabIds=s13fav[0]; var setFavEstabIds=s13fav[1];
  var tk=useToast(); var Toast=tk.Toast;
  // === Bouton retour systeme (Android/navigateur) : ferme l'ecran courant au lieu de quitter l'app ===
  var anyOverlayOpen=(estab!==null)||(book!==null)||sett||notifsOpen||showPremium||showPrivacy;
  function closeTopOverlay(){
    // Ordre de priorite : du plus "haut" (modale) au plus "bas" (ecran)
    if(showPremium){setShowPremium(false);return;}
    if(showPrivacy){setShowPrivacy(false);return;}
    if(book!==null){setBook(null);return;}
    if(estab!==null){setEstab(null);return;}
    if(notifsOpen){setNotifs(false);return;}
    if(sett){setSett(false);return;}
  }
  var overlayRef=useRef(false);
  overlayRef.current=anyOverlayOpen;
  var guardPushed=useRef(false);
  // Installe UN SEUL listener popstate pour toute la duree de vie de l'app
  useEffect(function(){
    function onPop(){
      if(overlayRef.current){
        // Un ecran est ouvert : on le ferme ET on re-arme une entree d'historique
        // pour que le PROCHAIN retour soit aussi capture (et ne quitte pas l'app)
        closeTopOverlay();
        try{window.history.pushState({hpGuard:true},"");}catch(e){}
      }
    }
    window.addEventListener("popstate",onPop);
    return function(){window.removeEventListener("popstate",onPop);};
  },[]);
  // Arme une entree d'historique des qu'un ecran s'ouvre (une seule fois)
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
    setFollowingIds(function(f){var next=was?f.filter(function(x){return x!==id;}):f.concat([id]);try{localStorage.setItem("hp_following",JSON.stringify(next));}catch(e){}return next;});
    tk.show(was?"Vous ne suivez plus cet etablissement":"Vous suivez cet etablissement","success");
  }
  function toggleFavEstab(id){
    var wasFav=favEstabIds.indexOf(id)>=0;
    setFavEstabIds(function(f){var next=wasFav?f.filter(function(x){return x!==id;}):f.concat([id]);try{localStorage.setItem("hp_fav_estabs",JSON.stringify(next));}catch(e){}return next;});
    tk.show(wasFav?"Retire des favoris":"Ajoute aux favoris","success");
  }

  // Logout - defini avant le routing pour eviter reference error
  async function logout(){
    await AuthService.logout();
    setAuth(null);setEstab(null);setBook(null);
    setSett(false);setNotifs(false);
    setCTab("feed");setPTab("feed");
  }

  // === ROUTING =====================================================

  if(!auth){
    return(
      <AuthScreen onAuth={function(t,status,email,userId){
        setAuth(AuthService.buildSession(t,status,email,userId));
      }}/>
    );
  }

  var BLOCKED_STATUSES=["pending","suspended","banned","refused","disabled"];
  if(BLOCKED_STATUSES.indexOf(auth.accountStatus)>=0){
    return <AccountStatusScreen auth={auth} onLogout={logout}/>;
  }

  var isPro  = auth.type!=="client";
  var accent = rC(auth.type);
  var proD   = auth.type==="hotel"?DataLayer.getHotels()[0]:DataLayer.getRestaurants()[0];
  var NC     = NC_DATA;
  var NP     = NP_DATA;
  var unread = (isPro?NP:NC).filter(function(n){return !n.read;}).length;

  function openProf(id,type){
    var l=type==="hotel"?DataLayer.getHotels():DataLayer.getRestaurants();
    setEstab(l.find(function(e){return e.id===id;})||l[0]);
  }
  function openChat(){
    setEstab(null);
    if(!isPro)setCTab("chat");else setPTab("chat");
  }

  if(sett)       return <Ov onClose={function(){setSett(false);}}>{function(close){return <SettingsS onBack={close} accType={auth.type} onLogout={logout} onPremium={function(){setSett(false);setShowPremium(true);}} onPrivacy={function(){setSett(false);setShowPrivacy(true);}} isPremium={isPremium}/>;}}</Ov>;
  if(notifsOpen) return <Ov onClose={function(){setNotifs(false);}}>{function(close){return <NotifP isPro={isPro} accent={accent} onBack={close} onNavigate={function(t){setNotifs(false);if(!isPro)setCTab(t);else setPTab(t);}}/>;}}</Ov>;

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
      {id:"discover",    icon:Search,        label:"Decouverte"},
      {id:"chat",        icon:MessageCircle, label:"Messages"},
      {id:"profile",     icon:User,          label:"Profil"},
    ];
    return(
      <div style={{height:"100%",background:DS.bg,fontFamily:"'DM Sans','Inter','Segoe UI',sans-serif",display:"flex",flexDirection:"column",maxWidth:420,margin:"0 auto",position:"relative"}}>
        <TopBar
          left={<div style={{fontSize:16,fontWeight:900,color:DS.text,letterSpacing:-0.5}}>HotelPlatform <span style={{color:DS.client}}>Travel</span></div>}
          right={headerRight}
        />
        {offline&&<div style={{background:DS.error+"18",borderBottom:"1px solid "+DS.error+"33",padding:"6px 16px",fontSize:11,color:DS.error,fontWeight:700,textAlign:"center"}}>Vous etes hors ligne</div>}
        <div key={cTab} style={{flex:1,overflowY:"auto",animation:"hp-fade-up 0.34s cubic-bezier(0.22,1,0.36,1)"}}>
          {cTab==="feed"     &&<div><AdBanner/><ClientFeed onProfile={openProf} followingIds={followingIds} onToggleFollow={toggleFollowGlobal} selfEmail={auth&&auth.email}/></div>}
          {cTab==="discover" &&<ClientDisc onProfile={openProf} onBook={function(e){setBook(e);}}/>}
          {cTab==="chat"     &&<ChatUI chats={DataLayer.getClientChats()} myColor={DS.client} nK="pN" iK="pI" vK="pV"/>}
          {cTab==="profile"  &&<ClientProf onSettings={function(){setSett(true);}} onPremium={function(){setShowPremium(true);}} isPremium={isPremium} premiumData={premiumData} onRenewPremium={renewPremium} onPrivacy={function(){setShowPrivacy(true);}} resaHistory={resaHistory} followingCount={followingIds.length} selfEmail={auth&&auth.email} favEstabIds={favEstabIds}/>}
        </div>
        <BotNav tabs={cTabs} active={cTab} set={setCTab} accent={DS.client}/>
        {estab&&<EstabM e={estab} onClose={function(){setEstab(null);}} onBook={function(bookingData){setBook(bookingData||estab);setEstab(null);}} onChat={openChat} followingIds={followingIds} onToggleFollow={toggleFollowGlobal} favEstabIds={favEstabIds} onToggleFavEstab={toggleFavEstab} viewerIsPro={false}/>}
        {book&&<BookM e={book} onClose={function(){setBook(null);}} selfEmail={auth&&auth.email} onBooked={function(resa){setResaHistory(function(h){var next=BookingService.appendToHistory(h,resa);try{localStorage.setItem("hp_resas",JSON.stringify(next));}catch(e){}return next;});setBook(null);}}/>}
        {showPremium&&<PremiumModal accType={auth.type} onClose={function(){setShowPremium(false);}} onSubscribe={subscribePremium}/>}
        {showPrivacy&&<PrivacyModal accType={auth.type} onClose={function(){setShowPrivacy(false);}} settings={privacySettings} onUpdate={updatePrivacy}/>}
        <Toast/>
      </div>
    );
  }

  // === PRO VIEW ===================================================
  var pTabs = auth.type==="hotel"
    ? [{id:"feed",         icon:Home,          label:"Accueil"},
       {id:"services",     icon:Package,       label:"Services"},
       {id:"reservations", icon:Calendar,      label:"Reservations"},
       {id:"chat",         icon:MessageCircle, label:"Messages"},
       {id:"profile",      icon:User,          label:"Profil"}]
    : [{id:"feed",         icon:Home,          label:"Accueil"},
       {id:"offres",       icon:Tag,           label:"Offres"},
       {id:"reservations", icon:Calendar,      label:"Reservations"},
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
      {offline&&<div style={{background:DS.error+"18",borderBottom:"1px solid "+DS.error+"33",padding:"6px 16px",fontSize:11,color:DS.error,fontWeight:700,textAlign:"center"}}>Vous etes hors ligne</div>}
      <div key={pTab} style={{flex:1,overflowY:"auto",animation:"hp-fade-up 0.34s cubic-bezier(0.22,1,0.36,1)"}}>
        {pTab==="feed"         &&<div><AdBanner/><ProFeed proType={auth.type} isPremium={isPremium} onPremium={function(){setShowPremium(true);}} onProfile={openProf} followingIds={followingIds} onToggleFollow={toggleFollowGlobal} selfEmail={auth&&auth.email}/></div>}
        {pTab==="services"     &&<HotelSvc data={proD}/>}
        {pTab==="offres"       &&<RestOff data={proD}/>}
        {pTab==="reservations" &&<ProResa proType={auth.type} onOpenChat={function(){setPTab("chat");}} clientPrivacySettings={privacySettings} selfEmail={auth&&auth.email}/>}
        {pTab==="chat"         &&<ChatUI chats={DataLayer.getProChats()} myColor={accent} nK="cN" vK="cV" qR={["Bonjour, disponible !","Je confirme","Veuillez nous appeler","Merci pour votre message"]}/>}
        {pTab==="profile"      &&<ProProf proType={auth.type} onSettings={function(){setSett(true);}} onPremium={function(){setShowPremium(true);}} isPremium={isPremium} premiumData={premiumData} onRenewPremium={renewPremium} onPrivacy={function(){setShowPrivacy(true);}}/>}
      </div>
      <BotNav tabs={pTabs} active={pTab} set={setPTab} accent={accent}/>
      {estab&&<EstabM e={estab} onClose={function(){setEstab(null);}} onBook={function(bookingData){setBook(bookingData||estab);setEstab(null);}} onChat={openChat} followingIds={followingIds} onToggleFollow={toggleFollowGlobal} favEstabIds={favEstabIds} onToggleFavEstab={toggleFavEstab} viewerIsPro={true}/>}
      {book&&<BookM e={book} onClose={function(){setBook(null);}} selfEmail={auth&&auth.email} onBooked={function(resa){setResaHistory(function(h){var next=BookingService.appendToHistory(h,resa);try{localStorage.setItem("hp_resas",JSON.stringify(next));}catch(e){}return next;});setBook(null);}}/>}
      {showPremium&&<PremiumModal accType={auth.type} onClose={function(){setShowPremium(false);}} onSubscribe={subscribePremium}/>}
      {showPrivacy&&<PrivacyModal accType={auth.type} onClose={function(){setShowPrivacy(false);}} settings={privacySettings} onUpdate={updatePrivacy}/>}
      <Toast/>
    </div>
  );
}
