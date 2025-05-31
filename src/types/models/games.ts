export interface Scene {
  id: string,
  name: string,
  objects: SceneObject[],
}

export interface SceneObject {
  name: string,
  verticesLocation: Coordenates,
  imageUrl: string,
  videoUrl: string,
}

export interface SceneObjectToSelect extends SceneObject {
  /** JWT that will contain in the payload if it is correct or not */
  selectionId: string,
}

export interface SceneObjectJWTPayload {
  isGameResult: boolean,
  objectName: string,
  sceneId: string,
  variator: number,
  generationTime: number,
}

export type Coordenates = ArrayLike<[number, number]>;

export interface Game {
  videoUrl: string,
  objects: SceneObjectToSelect[],
}