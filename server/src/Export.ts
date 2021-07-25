import { nanoid } from 'nanoid';
import fs from 'node:fs/promises';

function guid(): string {
  return nanoid(6);
}

export async function exportTabletopSimulator(
  name: string,
  cardNames: string[],
  faceUrl: string,
  backUrl: string,
  fileName: string
): Promise<void> {
  const cardIDs = cardNames.map((_, i) => 100 + i);

  const containedObjects = cardIDs.map((cardID, i) => ({
    GUID: guid(),
    Name: 'Card',
    Transform: {
      posX: 0,
      posY: 0,
      posZ: 0,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      scaleX: 1.0,
      scaleY: 1.0,
      scaleZ: 1.0,
    },
    Nickname: cardNames[i],
    Description: '',
    GMNotes: '',
    ColorDiffuse: {
      r: 0.713235259,
      g: 0.713235259,
      b: 0.713235259,
    },
    LayoutGroupSortIndex: 0,
    Value: 0,
    Locked: false,
    Grid: true,
    Snap: true,
    IgnoreFoW: false,
    MeasureMovement: false,
    DragSelectable: true,
    Autoraise: true,
    Sticky: true,
    Tooltip: true,
    GridProjection: false,
    HideWhenFaceDown: false,
    Hands: true,
    CardID: cardID,
    SidewaysCard: false,
    CustomDeck: {
      '3': {
        FaceURL: faceUrl,
        BackURL: backUrl,
        NumWidth: 10,
        NumHeight: 7,
        BackIsHidden: false,
        UniqueBack: true,
        Type: 0,
      },
    },
    LuaScript: '',
    LuaScriptState: '',
    XmlUI: '',
  }));

  const tts = {
    SaveName: '',
    Date: '',
    VersionNumber: '',
    GameMode: '',
    GameType: '',
    GameComplexity: '',
    Tags: [],
    Gravity: 0.5,
    PlayArea: 0.5,
    Table: '',
    Sky: '',
    Note: '',
    TabStates: {},
    LuaScript: '',
    LuaScriptState: '',
    XmlUI: '',
    ObjectStates: [
      {
        GUID: guid(),
        Name: 'Deck',
        Transform: {
          posX: 0,
          posY: 0,
          posZ: 0,
          rotX: 0,
          rotY: 0,
          rotZ: 0,
          scaleX: 1.0,
          scaleY: 1.0,
          scaleZ: 1.0,
        },
        Nickname: name,
        Description: '',
        GMNotes: '',
        ColorDiffuse: {
          r: 0.713235259,
          g: 0.713235259,
          b: 0.713235259,
        },
        LayoutGroupSortIndex: 0,
        Value: 0,
        Locked: false,
        Grid: true,
        Snap: true,
        IgnoreFoW: false,
        MeasureMovement: false,
        DragSelectable: true,
        Autoraise: true,
        Sticky: true,
        Tooltip: true,
        GridProjection: false,
        HideWhenFaceDown: false,
        Hands: false,
        SidewaysCard: false,
        DeckIDs: cardIDs,
        CustomDeck: {
          '7': {
            FaceURL: faceUrl,
            BackURL: backUrl,
            NumWidth: 10,
            NumHeight: 7,
            BackIsHidden: false,
            UniqueBack: true,
            Type: 0,
          },
        },
        LuaScript: '',
        LuaScriptState: '',
        XmlUI: '',
        ContainedObjects: containedObjects,
      },
    ],
  };

  await fs.writeFile(fileName, JSON.stringify(tts, null, 2));
}
