import React from 'react';
import { 
  BookOpen, 
  Settings, 
  ShoppingBag, 
  Code, 
  Rocket, 
  Search, 
  ThumbsUp, 
  ThumbsDown, 
  ChevronRight, 
  FileText, 
  Lock,
  Menu,
  X,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';

export const Icons = {
  Book: BookOpen,
  Settings: Settings,
  ShoppingBag: ShoppingBag,
  Code: Code,
  Rocket: Rocket,
  Search: Search,
  ThumbsUp: ThumbsUp,
  ThumbsDown: ThumbsDown,
  ChevronRight: ChevronRight,
  FileText: FileText,
  Lock: Lock,
  Menu: Menu,
  Close: X,
  Help: HelpCircle,
  Back: ArrowLeft
};

export const getIconByName = (name: string, className?: string) => {
  const props = { className: className || "w-6 h-6" };
  switch(name) {
    case 'rocket': return <Icons.Rocket {...props} />;
    case 'settings': return <Icons.Settings {...props} />;
    case 'shopping-bag': return <Icons.ShoppingBag {...props} />;
    case 'code': return <Icons.Code {...props} />;
    default: return <Icons.Book {...props} />;
  }
};