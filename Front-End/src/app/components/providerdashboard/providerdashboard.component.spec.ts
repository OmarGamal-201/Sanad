import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderdashboardComponent } from './providerdashboard.component';

describe('ProviderdashboardComponent', () => {
  let component: ProviderdashboardComponent;
  let fixture: ComponentFixture<ProviderdashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProviderdashboardComponent]
    });
    fixture = TestBed.createComponent(ProviderdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
