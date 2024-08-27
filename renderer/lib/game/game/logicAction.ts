import type {Character, Sentence} from "@lib/game/game/elements/text";
import type {Scene} from "@lib/game/game/elements/scene";
import type {Story} from "@lib/game/game/elements/story";
import type {Image} from "@lib/game/game/elements/image";
import type {Condition} from "@lib/game/game/elements/condition";
import type {Script} from "@lib/game/game/elements/script";
import type {Menu} from "@lib/game/game/elements/menu";
import {Values} from "@lib/util/data";
import {
    CharacterAction,
    ConditionAction,
    ControlAction, ImageAction,
    MenuAction,
    SceneAction,
    ScriptAction,
    SoundAction,
    StoryAction,
    TypedAction
} from "@lib/game/game/actions";
import {Sound} from "@lib/game/game/elements/sound";
import {Control} from "@lib/game/game/elements/control";
import {
    CharacterActionContentType, CharacterActionTypes,
    ConditionActionContentType, ConditionActionTypes,
    ControlActionContentType, ImageActionContentType, ImageActionTypes,
    MenuActionContentType,
    MenuActionTypes, SceneActionContentType, SceneActionTypes, ScriptActionContentType, ScriptActionTypes,
    SoundActionContentType, StoryActionContentType, StoryActionTypes
} from "@lib/game/game/actionTypes";

export namespace LogicAction {
    export type GameElement = Character | Scene | Story | Image | Condition | Script | Menu | Sound | Control;
    export type Actions =
        (TypedAction
        | CharacterAction
        | ConditionAction
        | ImageAction
        | SceneAction
        | ScriptAction
        | StoryAction
        | MenuAction
        | SoundAction
        | ControlAction) ;
    export type ActionTypes =
        Values<typeof CharacterActionTypes>
        | Values<typeof ConditionActionTypes>
        | Values<typeof ImageActionTypes>
        | Values<typeof SceneActionTypes>
        | Values<typeof ScriptActionTypes>
        | Values<typeof StoryActionTypes>
        | Values<typeof MenuActionTypes>
        | Values<typeof SoundAction.ActionTypes>
        | Values<typeof ControlAction.ActionTypes>;
    export type ActionContents =
        CharacterActionContentType
        & ConditionActionContentType
        & ImageActionContentType
        & SceneActionContentType
        & ScriptActionContentType
        & StoryActionContentType
        & MenuActionContentType
        & SoundActionContentType
        & ControlActionContentType;
}