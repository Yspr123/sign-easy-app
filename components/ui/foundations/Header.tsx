import React from 'react'
import { Button } from '../button'
import { Avatar, AvatarFallback } from '../avatar'

const Header = () => {
  const navItems = ["Home", "About", "Contact"]

  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-semibold text-foreground">SignEasy</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Button key={item} variant="ghost" className="text-muted-foreground hover:text-foreground">
                {item}
              </Button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              Invite team
            </Button>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header