import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BoidRafComponent } from './boid-raf/boid-raf.component';

@NgModule({
  declarations: [
    AppComponent,
    BoidRafComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
