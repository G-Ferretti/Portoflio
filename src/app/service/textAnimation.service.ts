import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class TextAnimationService{

    private animatedStaticMessage = new Subject<string>();
    private animatedCyclingMessage = new Subject<string>();
    private cyclingInterval: any = null;
    private currentCyclingIndex = 0;

    startStaticAnimation(message: string) {
        this.staticAnimation(message, 0);
    }

    startCyclingAnimation(messages: string[]) {
        this.stopCyclingAnimation(); // Stop any ongoing animations

        this.currentCyclingIndex = 0;

        const animateNext = async () => {
            const message = messages[this.currentCyclingIndex];
            await this.cyclingAnimation(message); // Wait for the current message to animate

            // Update index for the next message
            this.currentCyclingIndex = (this.currentCyclingIndex + 1) % messages.length;

            // Set timeout for the next animation after a delay
            this.cyclingInterval = setTimeout(animateNext, 1000);
        };

        animateNext(); // Start the animation
    }

    staticAnimation(message: string, index: number) {
        this.animatedStaticMessage.next(message.slice(0, index) + '|');

        if (index < message.length) {
            setTimeout(() => {
                this.staticAnimation(message, index + 1);
            }, 200);
        } else {
            setTimeout(() => {
                this.animatedStaticMessage.next(message);
            }, 500);
        }
    }

    async cyclingAnimation(message: string): Promise<void> {
        await this.cyclingAnimationForward(message, 0); // Animate forward
        await this.cyclingAnimationReverse(message, message.length); // Animate backward
    }

    async cyclingAnimationForward(message: string, index: number): Promise<void> {
        return new Promise(resolve => {
            this.animatedCyclingMessage.next(message.slice(0, index) + '|');

            if (index < message.length) {
                setTimeout(() => {
                    this.cyclingAnimationForward(message, index + 1).then(resolve); // Proper promise chaining
                }, 200);
            } else {
                setTimeout(() => {
                    this.animatedCyclingMessage.next(message); // Show the full message
                    resolve(); // Resolve the promise
                }, 500);
            }
        });
    }

    async cyclingAnimationReverse(message: string, index: number): Promise<void> {
        return new Promise(resolve => {
            this.animatedCyclingMessage.next(message.slice(0, index) + '|');

            if (index > 0) {
                setTimeout(() => {
                    this.cyclingAnimationReverse(message, index - 1).then(resolve); // Proper promise chaining
                }, 200);
            } else {
                setTimeout(() => {
                    this.animatedCyclingMessage.next(''); // Clear the message
                    resolve(); // Resolve the promise
                }, 500);
            }
        });
    }

    stopAllAnimations() {
        this.animatedStaticMessage.next('');
        this.animatedCyclingMessage.next('');
        this.stopCyclingAnimation();
    }

    stopCyclingAnimation() {
        if (this.cyclingInterval) {
            clearTimeout(this.cyclingInterval); // Clear the timeout
            this.cyclingInterval = null; // Reset the reference
        }
    }

    getAnimatedStaticMessage() {
        return this.animatedStaticMessage.asObservable();
    }

    getAnimatedCyclingMessage() {
        return this.animatedCyclingMessage.asObservable();
    }
}