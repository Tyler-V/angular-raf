import { Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, Renderer, ViewChild } from '@angular/core';
import Boids, { Flock } from 'boids';
declare var FPSMeter;

@Component({
  selector: 'boid-raf',
  templateUrl: './boid-raf.component.html',
  styleUrls: ['./boid-raf.component.css']
})
export class BoidRafComponent implements OnInit, OnDestroy {

  @ViewChild('canvas') canvasRef: ElementRef;

  public running: boolean;
  public flock: Flock;
  public meter: any;
  public img: HTMLImageElement;

  constructor(private ngZone: NgZone, private elementRef: ElementRef, private renderer: Renderer) {
    this.meter = new FPSMeter({
      interval: 50,     // Update interval in milliseconds.
      smoothing: 10,      // Spike smoothing strength. 1 means no smoothing.
      show: 'fps',   // Whether to show 'fps', or 'ms' = frame duration in milliseconds.
      toggleOn: 'click', // Toggle between show 'fps' and 'ms' on this event.
      decimals: 1,       // Number of decimals in FPS number. 1 = 59.9, 2 = 59.94, ...
      maxFps: 60,      // Max expected FPS value.
      threshold: 100,     // Minimal tick reporting interval in milliseconds.

      // Meter position
      position: 'absolute', // Meter position.
      zIndex: 10,         // Meter Z index.
      left: '5px',      // Meter left offset.
      top: '5px',      // Meter top offset.
      right: 'auto',     // Meter right offset.
      bottom: 'auto',     // Meter bottom offset.
      margin: '0 0 0 0',  // Meter margin. Helps with centering the counter when left: 50%;

      // Theme
      theme: 'colorful', // Meter theme. Build in: 'dark', 'light', 'transparent', 'colorful'.
      heat: 1,      // Allow themes to use coloring by FPS heat. 0 FPS = red, maxFps = green.

      // Graph
      graph: 1, // Whether to show history graph.
      history: 20 // How many history states to show in a graph.
    });

    this.flock = new Boids({
      boids: 100,             // The amount of boids to use
      speedLimit: 3,          // Max steps to take per tick
      accelerationLimit: 5,   // Max acceleration per tick
      separationDistance: 60, // Radius at which boids avoid others
      alignmentDistance: 180, // Radius at which boids align with others
      choesionDistance: 180,  // Radius at which boids approach others
      separationForce: 0.15,  // Speed to avoid at
      alignmentForce: 0.25,   // Speed to align with other boids
      choesionForce: 0.1,     // Speed to move towards other boids
      attractors: [
        Infinity, // xPosition
        Infinity, // yPosition
        10, // radius
        0.25 // force
      ]
    });

    // Set image
    this.img = new Image();
    this.img.src = "assets/images/bird.png";
  }

  ngOnInit() {
    this.paint(false);
  }

  ngOnDestroy() {
    this.running = false;
  }

  @HostListener('window:resize') onResize() {
    let ctx: CanvasRenderingContext2D = this.canvasRef.nativeElement.getContext('2d');
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
  }

  toggleStart() {
    this.running = !this.running;
    if (this.running) {
      this.ngZone.runOutsideAngular(() => this.paint(true));
    }
  }

  private paint(loop = true) {
    let ctx: CanvasRenderingContext2D = this.canvasRef.nativeElement.getContext('2d');
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    // Background
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, 1920, 950);

    // Advance flock
    this.flock.tick();

    // Draw flock
    for (let flock of this.flock.boids) {
      let xPosition = flock[0] + window.innerWidth / 2;
      let yPosition = flock[1] + window.innerHeight / 2;
      let speedX = flock[2];
      let speedY = flock[3];
      let xAcceleration = flock[4];
      let yAcceleration = flock[5];
      let angle = Math.atan2(speedY, speedX) + 0.5 * Math.PI;

      ctx.save();
      ctx.translate(xPosition, yPosition);
      ctx.rotate(angle);
      ctx.scale(0.05, 0.05);
      ctx.drawImage(this.img, 0, 0);
      ctx.fill();
      ctx.restore();
    };

    // Schedule next
    if (loop && this.running) {
      this.meter.tick();
      requestAnimationFrame(() => this.paint(loop));
    }
  }
}
