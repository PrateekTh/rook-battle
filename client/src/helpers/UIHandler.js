export default class UIHandler {
    
    constructor(scene){

        //Define Temporary Message Renderer
        this.showMessage = (scene, message, x, y, duration = 2000) => {
            // Create the text object
            const text = scene.add.text(x, y, message, { font:'40px KodeMono', fill: '#ffffff' });  // Adjust properties as needed
            text.setOrigin(0.5,0.5)
            text.setAlign('center')
            // Move and Fade out the text during the specified duration
            scene.tweens.add({
              y: y-100,
              targets: text,
              alpha: 0,
              ease: 'quadratic.easeOut', // Adjust easing if needed
              duration: duration,
              onComplete: () => text.destroy() // Destroy the text object after fade out
            });
        }
        
        //Define Permanent Text Renderer
        this.finalText = (scene, message, x, y) =>{
            //Create Text Object
            const text = scene.add.text(x, y, message, { font: '40px MajorMono', fill: '#82E0AA' });  // Adjust properties as needed
            text.setOrigin(0.5,0.5)
            text.setAlign('center')
            return text;
        }
    }
}