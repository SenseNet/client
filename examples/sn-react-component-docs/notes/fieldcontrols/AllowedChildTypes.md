### AllowedChildTypes

(To see this control in action, please login at [https://admin.sensenet.com/](https://admin.sensenet.com/) to https://dev.demo.sensenet.com with one of the given demo users)

The AllowedChildTypes Field Control represents a editable list of content types that are explicitly allowed to be created under this content. The AllowedChildTypes field itself does not always store the values you see in the user interface. For example Folders and Pages cannot have their own setting (see below), they always inherit from their parent. Other containers may inherit their allowed child types list from their content type (CTD). If you as a developer need the actual list of types that your users will be able to create in a container, use the EffectiveAllowedChildTypes read only field.
This controls by default shows the content of the EffectiveAllowedChildTypes field and lets you remove or add ContentTypes to the list. If you remove all the types from the list, the control will show you the list of Types that are set in the CTD and that cannot be removed.
