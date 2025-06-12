
import React from 'react';
import { Heart, Mail, Phone, MapPin, Shield, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-lg">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">MedPal</h3>
                <span className="text-xs text-primary">AI Healthcare Assistant</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Your trusted AI companion for health insights, symptom analysis, and medical guidance. 
              Always consult healthcare professionals for serious concerns.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/diagnosis" className="text-muted-foreground hover:text-primary transition-colors">AI Diagnosis</a></li>
              <li><a href="/chat" className="text-muted-foreground hover:text-primary transition-colors">Health Chat</a></li>
              <li><a href="/monitor" className="text-muted-foreground hover:text-primary transition-colors">Health Monitor</a></li>
              <li><a href="/history" className="text-muted-foreground hover:text-primary transition-colors">Medical History</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Support</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-accent" />
                <span className="text-muted-foreground">24/7 AI Support</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-accent" />
                <span className="text-muted-foreground">support@medpal.ai</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-accent" />
                <span className="text-muted-foreground">1-800-MEDPAL</span>
              </li>
            </ul>
          </div>

          {/* Privacy & Security */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Privacy & Security</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-accent" />
                <span className="text-muted-foreground">HIPAA Compliant</span>
              </li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Medical Disclaimer</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground">
              © 2024 MedPal AI. All rights reserved. Not a substitute for professional medical advice.
            </p>
            <p className="text-xs text-muted-foreground mt-2 md:mt-0">
              Always consult with healthcare professionals for medical decisions.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
