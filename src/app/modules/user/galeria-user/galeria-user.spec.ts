import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GaleriaUser } from './galeria-user';

describe('GaleriaUser', () => {
  let component: GaleriaUser;
  let fixture: ComponentFixture<GaleriaUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GaleriaUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GaleriaUser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
