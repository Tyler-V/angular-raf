import { Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, Renderer, ViewChild } from '@angular/core';
import boids, { Flock } from 'boids';

@Component({
  selector: 'raf',
  templateUrl: './raf.component.html',
  styleUrls: ['./raf.component.less']
})
export class RafComponent implements OnInit, OnDestroy {

  @ViewChild('canvas') canvasRef: ElementRef;
  private running: boolean;
  private flock: Flock;

  constructor(private ngZone: NgZone, private elementRef: ElementRef, private renderer: Renderer) {
    this.flock = boids({
      boids: 200,             // The amount of boids to use
      speedLimit: 4,          // Max steps to take per tick
      accelerationLimit: 1,   // Max acceleration per tick
      separationDistance: 60, // Radius at which boids avoid others
      alignmentDistance: 180, // Radius at which boids align with others
      cohesionDistance: 180,  // Radius at which boids approach others
      separationForce: 0.15,  // Speed to avoid at
      alignmentForce: 0.25,   // Speed to align with other boids
      cohesionForce: 0.1,     // Speed to move towards other boids
      attractors: [[200, 250, 1000, 0.3], [600, 250, 1000, 0.3]]
    });
  }

  ngOnInit() {
    // Make the flock visible by ticking a few times
    for (let i = 0; i < 50; i++) {
      this.flock.tick();
    }
    // Paint once to make things visible
    this.paint(false);
  }

  ngOnDestroy() {
    this.running = false;
  }

  @HostListener('window:resize') onResize() {
    // Make sure canvas width doesn't exceed available width and
    // preserve its aspect ratio.
    const width = Math.min(1920, this.elementRef.nativeElement.offsetWidth);
    const height = width / 950 * 500;
    this.renderer.setElementStyle(this.canvasRef.nativeElement, 'width', `${width}px`);
    this.renderer.setElementStyle(this.canvasRef.nativeElement, 'height', `${height}px`);
  }

  toggleSimulation() {
    this.running = !this.running;
    if (this.running) {
      this.ngZone.runOutsideAngular(() => this.paint(true));
    }
  }

  private paint(loop = true) {
    let ctx: CanvasRenderingContext2D = this.canvasRef.nativeElement.getContext('2d');

    // Background
    ctx.fillStyle = 'rgb(221, 0, 49)';
    ctx.fillRect(0, 0, 1920, 950);

    // Advance flock
    this.flock.tick();

    // Draw flock
    ctx.beginPath();
    ctx.fillStyle = `rgb(255,255,255)`;
    for (const [x, y, speedX, speedY] of this.flock.boids) {
      const angle = Math.atan2(speedY, speedX) + 0.5 * Math.PI;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.scale(0.4, 0.4);

      ctx.beginPath();
      ctx.arc(x, y, 10, 0, (360 * Math.PI)/180, true);
      ctx.fill();

      ctx.restore();
    };

    // Schedule next
    if (loop && this.running) {
      requestAnimationFrame(() => this.paint(loop));
    }
  }
}