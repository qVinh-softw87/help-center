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
  ChevronDown,
  FileText, 
  Lock,
  Menu,
  X,
  HelpCircle,
  ArrowLeft,
  User,
  Plus,
  Edit,
  Trash2,
  Upload,
  Eye,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Sparkles,
  Send,
  Sun,
  Moon,
  Clock
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
  ChevronDown: ChevronDown,
  FileText: FileText,
  Lock: Lock,
  Menu: Menu,
  Close: X,
  Help: HelpCircle,
  Back: ArrowLeft,
  User: User,
  Plus: Plus,
  Edit: Edit,
  Trash2: Trash2,
  Upload: Upload,
  Eye: Eye,
  CheckCircle2: CheckCircle2,
  XCircle: XCircle,
  Chat: MessageSquare,
  Sparkles: Sparkles,
  Send: Send,
  Sun: Sun,
  Moon: Moon,
  Clock: Clock
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