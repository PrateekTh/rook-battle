export default class UIHandler {
    constructor(scene){
        this.buildGameText = () => {
            //scene.setUp = scene.add.text(200, 200, "Start Game").setFontSize(40).setFontFamily("Trebuchet MS");
        }

        this.buildUI = () => {
            this.buildGameText();
        }


        this.showMessage = (scene, message, x, y, duration = 2000) => {
            // Create the text object
            const text = scene.add.text(x, y, message, { font:'40px KodeMono', fill: '#ffffff' });  // Adjust properties as needed
            text.setOrigin(0.5,0.5)
            text.setAlign('center')
            // Fade out the text after the specified duration
            scene.tweens.add({
              y: y-100,
              targets: text,
              alpha: 0,
              ease: 'quadratic.easeOut', // Adjust easing if needed
              duration: duration,
              onComplete: () => text.destroy() // Destroy the text object after fade out
            });
        
        this.finalText = (scene, message, x, y) =>{
            const text = scene.add.text(x, y, message, { font: '40px MajorMono', fill: '#ffffff' });  // Adjust properties as needed
            text.setOrigin(0.5,0.5)
            text.setAlign('center')
        }
            return text;
        }
    }
}