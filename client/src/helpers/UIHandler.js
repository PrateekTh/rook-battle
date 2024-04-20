export default class UIHandler {
    constructor(scene){
        this.buildGameText = () => {
            scene.setUp = scene.add.text(200, 200, "Start Game").setFontSize(40).setFontFamily("Trebuchet MS");
        }

        this.buildUI = () => {
            this.buildGameText();
        }
    }
}