package com.freezzz.watchkey;

import android.app.*;
import android.content.*;
import android.media.session.*;
import android.os.*;
import android.view.KeyEvent;

public class KeySessionService extends Service {
  MediaSession session;
  @Override public void onCreate(){super.onCreate(); String channel="watchkey_media"; if(Build.VERSION.SDK_INT>=26){NotificationChannel c=new NotificationChannel(channel,"WatchKey media controls",NotificationManager.IMPORTANCE_LOW); ((NotificationManager)getSystemService(NOTIFICATION_SERVICE)).createNotificationChannel(c);}
    Notification n=new Notification.Builder(this,channel).setContentTitle("WatchKey активен").setContentText("Ожидание мультимедийных кнопок").setSmallIcon(android.R.drawable.ic_media_play).build(); startForeground(71,n);
    session=new MediaSession(this,"WatchKey"); session.setFlags(MediaSession.FLAG_HANDLES_MEDIA_BUTTONS|MediaSession.FLAG_HANDLES_TRANSPORT_CONTROLS); session.setCallback(new MediaSession.Callback(){@Override public boolean onMediaButtonEvent(Intent intent){KeyEvent e=intent.getParcelableExtra(Intent.EXTRA_KEY_EVENT); if(e==null||e.getAction()!=KeyEvent.ACTION_DOWN)return true; String key=null; switch(e.getKeyCode()){case KeyEvent.KEYCODE_MEDIA_PLAY:case KeyEvent.KEYCODE_MEDIA_PAUSE:case KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE:key="play";break;case KeyEvent.KEYCODE_MEDIA_NEXT:key="next";break;case KeyEvent.KEYCODE_MEDIA_PREVIOUS:key="prev";break;} if(key!=null)launchMapped(key); return true;}}); session.setActive(true);
  }
  void launchMapped(String key){String value=getSharedPreferences("watchkey",MODE_PRIVATE).getString(key,""); int p=value.lastIndexOf('['); int q=value.lastIndexOf(']'); if(p>=0&&q>p){String pkg=value.substring(p+1,q); Intent i=getPackageManager().getLaunchIntentForPackage(pkg); if(i!=null){i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK); startActivity(i);}}}
  @Override public int onStartCommand(Intent i,int f,int id){return START_STICKY;}
  @Override public void onDestroy(){if(session!=null){session.setActive(false);session.release();} super.onDestroy();}
  @Override public android.os.IBinder onBind(Intent i){return null;}
}
