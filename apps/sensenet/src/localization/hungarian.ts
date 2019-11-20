import { DeepPartial } from '@sensenet/client-utils'

const values: DeepPartial<typeof import('./default').default> = {
  addButton: {
    new: 'Új...',
    tooltip: 'Tartalom létrehozása vagy feltöltése',
    upload: 'Feltöltés',
    dialogTitle: 'Új {0} létrehozása',
  },
  commandPalette: {
    title: 'Command palette megnyitása',
  },
  contentContextMenu: {
    copy: 'Másolás',
    delete: 'Törlés',
    editProperties: 'Tulajdonságok szerkesztése',
    move: 'Áthelyezés',
    open: 'Megnyitás',
  },
  contentInfoDialog: {
    dialogTitle: '{0} tulajdonságai',
    type: 'Típus',
    owner: 'Tulajdonos',
    path: 'Elérési út',
    created: 'Létrehozva',
    unknownOwner: 'Ismeretlen',
  },
  deleteContentDialog: {
    dialogTitle: 'Tényleg törlöd?',
    dialogContent: 'Az alábbi tartalmak törlésére készülsz:',
    permanentlyLabel: 'Véglegesen',
    permanentlyHint: 'A tartalom nem kerül a kukába, rögtön törlődik',
    deletingContent: 'Törlés folyamatban...',
    deleteButton: 'Törlés',
    cancelButton: 'Mégsem',
  },
  drawer: {
    titles: {
      Content: 'Tartalom',
      Search: 'Keresés',
      Setup: 'Beállítás',
      'Users and groups': 'Felhasználók és csoportok',
      'Version info': 'Verzió névjegye',
      'Content Types': 'Tartalom típusok',
      Localization: 'Nyelvi fájlok',
      Trash: 'Kuka',
    },
    descriptions: {
      Content: 'Tartalom böngészése',
      Search: 'Testreszabott keresések futtatása és mentése későbbi használatra',
      Setup: 'A rendszer beállításai',
      'Users and groups': 'Felhasználó és csoport kezelése, szerkesztése',
      'Version info': 'Információk a telepített csomagokról és a verzióikról',
      'Content Types': 'Tartalom típusok kezelése',
      Localization: 'Nyelvi fájlok kezelése',
      Trash: 'Törölt elemek kezelése',
    },

    personalSettingsTitle: 'Személyes beállítások',
    personalSettingsSecondaryText: 'Az alkalmazás testreszabása',
    dashboardTitle: 'Irányítópult',
    dashboardSecondaryText:
      'Olyan egyoldalas vizuális felület, amelynek segítségével a felhasználó első ránézésre monitorozhatja legfontosabb céljainak vagy elvárásainak megvalósulását',
  },
  editPropertiesDialog: {
    dialogTitle: '{0} tulajdonságainak szerkesztése',
  },
  login: {
    loginTitle: 'Bejelentkezés',
    loginButtonTitle: 'Bejelentkezés',
    greetings: 'Üdvözlet, {0}!',
    loggingInTo: 'Bejelentkezés ide: {0}...',
    loginFailed: 'A bejelentkezés nem sikerült.',
    userNameLabel: 'Felhasználónév',
    userNameHelperText: 'A rendszerben tárolt felhasználónév',
    passwordLabel: 'Jelszó',
    passwordHelperText: 'A felhasználóhoz tartozó jelszó',
    repositoryLabel: 'Elérési út',
    repositoryHelperText: 'A repository teljes elérési útja (pl.: https://my-sensenet.com)',
  },
  logout: {
    logoutCancel: 'Mégsem',
    logoutButtonTitle: 'Kijelentkezés',
    logoutDialogTitle: 'Biztosan kijelentkezel?',
    loggingOutFrom: (repoUrl: string) => `Kijelentkezés a ${repoUrl} repository-ból...`,
    logoutConfirmText: (repoUrl: string, userName: string) =>
      `Jelenleg a ${repoUrl} repository-t használod ${userName} felhasználóval. Biztosan kijelentkezel?`,
  },
  personalSettings: {
    languageTitle: 'A választott nyelv megnevezése',
    themeTitle: 'Sötét vagy világot színséma beállítása',
    commandPaletteTitle: 'Command palette beállításai',
    commandPaletteEnable: 'Command palette engedélyezése vagy tiltása',
    commandPaletteWrapQuery: 'Command palette lekérdezés sablonok beállítása',
    contentTitle: 'Tartalom böngészésére vonatkozó beállítások',
    contentFields: 'Megjelenítendő mezők beállítása',
    contentBrowseType:
      'Böngészés típus kiválasztása: simple (egyszerű), explore (lista és fa) vagy commander (dupla paneles)',
    drawer: 'Oldalsó menüsáv beállításai',
    drawerEnable: 'Menüsáv engedélyezése / tiltása',
    drawerItems: 'Megjelenítendő elemek',
    drawerType: 'Menüsáv típusa: mini-variant (összecsukható), permanent (mindig kibontott), temporary (ideiglenes) ',
    lastRepository: 'A legutóbb használt repository url',
    platformDependentTitle: 'Platform függő beállítások',
    repositoryTitle: 'Repository beállítások',
    repositoryUrl: 'A repository elérési útvonala, pl.: https://my-sensenet-repository.org',
    repositoryLoginName: 'A legutóbb használt bejelentkezési név',
    repositoryDisplayName: 'Egy tetszőleges megjelenítendő név',
  },
  repositorySelector: {
    anotherRepo: 'Másik repository',
    loggedInAs: 'Bejelentkezve mint {0}',
    notLoggedIn: 'Nincs bejelentkezve',
    typeToFilter: 'Kezdj írni a szűréshez...',
  },
}

export default values
