import { DeepPartial } from '@sensenet/client-utils'

const values: DeepPartial<typeof import('./default').default> = {
  addButton: {
    new: 'Új...',
    addNew: 'Új hozzáadása',
    tooltip: 'Tartalom létrehozása vagy feltöltése',
    upload: 'Feltöltés',
    dialogTitle: 'Új {0} létrehozása',
    noItems: 'Nincs hozzáadható elem',
  },
  commandPalette: {
    title: 'Command palette megnyitása',
    searchSuggestionList: 'Keresési javaslatok listája',
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
    additionalTextForUsers:
      'A felhasználókat és a csoportokat nem lehet kukába helyezni, mindig véglegesen törlődnek a rendszerből. Ha nem szeretné véglegesen törölni a felhasználót vagy csoportot lépjen át "Felhasználók és csoportok" menüpontba, és használja az engedélyezés/letiltás kapcsolót.',
  },
  copyMoveContentDialog: {
    copy: {
      title: `'{0}' másolása ide: '{1}' `,
      inProgress: 'Másolás folyamatban...',
      titleMultiple: `{0} content másolása ide: '{1}'`,
      copyButton: 'Másolás',
      cancelButton: 'Mégsem',
      copySucceededNotification: '{0} másolása megtörtént ide: {1}',
      copyMultipleSucceededNotification: '{0} content másolása megörtént ide: {1}',
      copyFailedNotification: 'Nem sikerült a {0} másolása ide: {1}',
      copyMultipleFailedNotification: 'Nem sikerült {0} content másolása ide: {1}',
    },
    move: {
      title: `'{0}' áthelyezése ide: '{1}'`,
      inProgress: 'Áthelyezés folyamatban...',
      titleMultiple: `{0} content áthelyezése ide: '{1}'`,
      copyButton: 'Áthelyezés',
      cancelButton: 'Mégsem',
      copySucceededNotification: '{0} áthelyezése megtörtént ide: {1}',
      copyMultipleSucceededNotification: '{0} content áthelyezése megtörtént ide: {1}',
      copyFailedNotification: 'Nem sikerült a {0} áthelyezése ide: {1}',
      copyMultipleFailedNotification: 'Nem sikerült {0} content áthelyezése ide: {1}',
    },
  },
  drawer: {
    titles: {
      Content: 'Tartalom',
      Search: 'Keresés',
      Setup: 'Beállítás',
      UsersAndGroups: 'Felhasználók és csoportok',
      ContentTypes: 'Tartalom típusok',
      Localization: 'Nyelvi fájlok',
      Trash: 'Kuka',
      CustomContent: 'Egyedi tartalom',
      Settings: 'Beállítások',
      Configuration: 'Konfiguráció',
      Stats: 'Statisztika',
      ApiAndSecurity: 'Api és biztonság',
      Webhooks: 'Webhooks',
      AdminUiCustomization: 'Admin-ui tesztreszabás',
    },
    descriptions: {
      Content: 'Tartalom böngészése',
      Search: 'Testreszabott keresések futtatása és mentése későbbi használatra',
      Setup: 'A rendszer beállításai',
      UsersAndGroups: 'Felhasználó és csoport kezelése, szerkesztése',
      ContentTypes: 'Tartalom típusok kezelése',
      Localization: 'Nyelvi fájlok kezelése',
      Trash: 'Törölt elemek kezelése',
      CustomContent: 'Egyedi tartalmak böngészése',
      Settings: 'A rendszer beállításai',
    },

    personalSettingsTitle: 'Személyes beállítások',
    personalSettingsSecondaryText: 'Az alkalmazás testreszabása',
    newSearch: 'Új keresés indítása',
    add: 'Hozzáadás',
    underConstruction: 'Fejlesztés alatt',
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
    contentBrowseType: 'Böngészés típus kiválasztása: jelenleg csak az explore (lista és fa) nézet elérhető',
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
  topMenu: {
    personalSettings: 'Személyes beállítások',
    logout: 'Kijelentkezés',
    changePassword: 'Jelszó módosítása',
    openUserMenu: 'Felhasználói menü kinyitása',
    openNewMenu: 'Újdonságok',
    accountSettings: 'Felhasználói beállítások',
  },
  settings: {
    edit: 'Módosítás',
    learnMore: 'Bővebb információ',
    stats: 'Statisztika',
    storage: 'Tárhely',
    users: 'Felhasználók',
    workspaces: 'Munkaterületek',
    content: 'Content',
    numberOfRoles: 'Szerepek száma',
    contentTypes: 'Content typusok',
    usage: 'Használat',
    components: 'Components',
    componentId: 'Component Id',
    version: 'Verzió',
    latestOfficialVersion: 'Utolsó hivatalos verzió',
    latest: 'Legfrissebb',
    description: 'Leírás',
    releaseDate: 'Release dátuma',
    executionDate: 'Futtatás dátuma',
    componentVersion: 'Component verzió',
    installedPackages: 'Telepített csomagok',
    files: 'Fájlok',
    oldVersions: 'Régi verziók',
    log: 'Log',
    system: 'Rendszer',
    apiEndpoint: 'API végpont',
    apiAndSecurity: 'API és biztonság',
    apiEndPointApi: 'API végpont:',
    apiEndPointIs: 'Identity Server url:',
    apiClients: 'API clients, frameworks and libs',
    learnAboutApi: 'Learn about API clients and frameworks',
    clientLink: 'https://github.com/SenseNet/sn-client',
    apiKeys: 'API keys',
    yourAppId: 'ClientID',
    personalAccessToken: 'Personal Access Token',
    clientDescription:
      'The client id and secret is required when you are developing a tool or another server-side application that needs to connect to the repository service. In this case all requests to the repository will be made in the name of a technical user represented by the client id and secret you see below. Please make sure you protect these values because they grant access to your repository. For more details, please visit <a href="https://docs.sensenet.com/tutorials/authentication/how-to-authenticate-dotnet" taget="_blank">https://docs.sensenet.com/tutorials/authentication/how-to-authenticate-dotnet</a>',
    spaDescription:
      'This client id is required when you are creating a single-page application or a mobile app. In this case users will log in to the system individually using their own credentials. The client id below will identify your application in our authentication flow. Please copy the client id and use it in your application based on the examples in the documentation. For more details, please visit <a href="https://docs.sensenet.com/tutorials/authentication/how-to-authenticate-react" target="_blank">https://docs.sensenet.com/tutorials/authentication/how-to-authenticate-react</a>',
    clientId: 'Client ID',
    clientSecret: 'Client Secret',
    generate: 'Generate access token',
    regenerate: 'Regenerate',
    latestBackendRelease: 'Utolsó backend release:',
    latestFrontendRelease: 'Utolsó AdminUI release:',
    goToChangeLog: 'Changelog megnyitása',
    componentsInfo:
      'A sensenet komponensei. Egy komponens állhat több csomagból is, de akár egy csomag is alkothat komponenst.',
    installedPackagesInfo:
      'Csomagok, melyekből a sensenet komponensek felépülnek. Léteznek olyan csomagok is, melyek nem felelősek a komponensekért, többszöri futtatásra lettek létrehozva - ilyenek a tool-típusú csomagok. Ezek például kontent törlésre vagy indexelésre használatosak.',
  },
  forms: {
    referencePicker: 'Referencia választó',
    avatarPicker: 'Avatar választó',
    removeAvatar: 'Avatar törlése',
    changeReference: 'Referencia módosítása',
    addReference: 'Referencia hozzáadása',
    ok: 'Ok',
    cancel: 'Vissza',
    upload: 'Feltöltés',
    submit: 'Küldés',
    inputPlaceHolder: 'Új típus hozzáadásához kezdje el gépelni',
    emptyField: '<Ez a mező üres>',
  },
  common: {
    loadingContent: 'Tartalom betöltése...',
  },
  batchActions: {
    delete: 'Kijelölt elemek törlése',
    move: 'Kijelölt elemek áthelyezése',
    copy: 'Kijelölt elemek másolása',
  },
  permissionEditor: {
    assign: 'Új jogosultság hozzáadása',
    setPermissons: 'Jogosultságállítás a következőn: ',
    errorGetAcl: 'Hiba történt a jogosultságok lekérdezése során',
    noContent: 'Ennek a tartalomnak nincs közvetlen jogosultság beállítása',
    inherited: 'Öröklött jogosultságok',
    setOnThis: 'Ezen a kontenten beállított jogosultságok',
    errorGetPermissionSetting: 'Hiba történt a beállítások lekérdezése során',
    permissions: 'Jogosultságok',
    grantFullAccess: 'Teljes hozzáférés',
    localOnly: 'Helyi módosítás',
    newEntry: 'Új engedélybejegyzés',
    add: 'Hozzáadás',
    members: 'Csoporttagok',
    errorGetMembersInfo: 'Hiba történt a csoporttagok lekérdezése során',
    addNewMember: '+ Új tag hozzáadása',
    makePublic: 'Tartalom nyilvánossá tétele',
    makePrivate: 'Tartalom priváttá tétele',
    cancel: 'Vissza',
    reset: 'Visszaállítás',
    name: 'Név',
    enterName: 'Írj be egy felhasználó vagy csoport nevet',
  },
  feedback: {
    title: 'Küldj nekünk visszajelzést vagy új ötletet',
    feedbackText1: (link: string) => `A visszajelzések és ötletek menedzselésére egy publikus ${link}-ot használunk.`,
    feedbackText2:
      'Új visszajelzés hozzáadásához küldj egy e-mailt az alábbi címre, amelyben leírod a javaslatod. </br> (email tárgya - a visszajelzés tárgya; email tartalma - visszajelzés leírása)',
    feedbackText3: (link: string) =>
      `A meglévő visszajelzéseket és azok állapotát bármikor ellenőrizheted a nyilvános ${link}-on.`,
    feedbackText4: 'Köszönjük a visszajelzést!',
    cancel: 'Vissza',
  },
  changePassword: {
    changeYourPassword: 'Jelszómódosítás',
    cancel: 'Cancel',
    update: 'Küldés',
    oldPassword: 'Régi jelszó',
    newPassword: 'Új jelszó',
    confirmNew: 'Új jelszó megerősítése',
    changePasswordSuccess: 'A jelszóváltoztatás sikeres',
    passwordsDontMatch: 'A beírt jelszavak nem egyeznek!',
  },
  multiPartProgressLine: {
    available: 'Elérhető',
  },
}

export default values
